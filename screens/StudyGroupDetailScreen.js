import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Dimensions,
  Modal,
  Image,
  Animated,
  Linking,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView, Swipeable, TapGestureHandler, State } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { studyGroupsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width, height } = Dimensions.get('window');

const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VOICE: 'voice',
  DOCUMENT: 'document',
  LINK: 'link',
};

const REACTIONS = [
  { emoji: '👍', name: 'like' },
  { emoji: '❤️', name: 'love' },
  { emoji: '🔥', name: 'fire' },
  { emoji: '😂', name: 'laugh' },
  { emoji: '😮', name: 'wow' },
  { emoji: '🎉', name: 'celebrate' },
];

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    icon: 'happy-outline',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
  },
  {
    name: 'People',
    icon: 'person-outline',
    emojis: ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳', '👩‍🦲', '🧑‍🦲', '👨‍🦲', '🧔‍♀️', '🧔', '🧔‍♂️', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳', '👳‍♂️', '🧕', '👮‍♀️', '👮', '👮‍♂️', '👷‍♀️', '👷', '👷‍♂️', '💂‍♀️', '💂', '💂‍♂️', '🕵️‍♀️', '🕵️', '🕵️‍♂️', '👩‍⚕️', '🧑‍⚕️', '👨‍⚕️', '👩‍🌾', '🧑‍🌾', '👨‍🌾', '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🎓', '🧑‍🎓', '👨‍🎓', '👩‍🎤', '🧑‍🎤', '👨‍🎤', '👩‍🏫', '🧑‍🏫', '👨‍🏫', '👩‍🏭', '🧑‍🏭', '👨‍🏭', '👩‍💻', '🧑‍💻', '👨‍💻', '👩‍💼', '🧑‍💼', '👨‍💼', '👩‍🔧', '🧑‍🔧', '👨‍🔧', '👩‍🔬', '🧑‍🔬', '👨‍🔬', '👩‍🎨', '🧑‍🎨', '👨‍🎨', '👩‍🚒', '🧑‍🚒', '👨‍🚒', '👩‍✈️', '🧑‍✈️', '👨‍✈️', '👩‍🚀', '🧑‍🚀', '👨‍🚀', '👩‍⚖️', '🧑‍⚖️', '👨‍⚖️', '👰‍♀️', '👰', '👰‍♂️', '🤵‍♀️', '🤵', '🤵‍♂️', '👸', '🤴', '🥷', '🦸‍♀️', '🦸', '🦸‍♂️', '🦹‍♀️', '🦹', '🦹‍♂️', '🤶', '🧑‍🎄', '🎅', '🧙‍♀️', '🧙', '🧙‍♂️', '🧝‍♀️', '🧝', '🧝‍♂️', '🧛‍♀️', '🧛', '🧛‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️', '🧚‍♀️', '🧚', '🧚‍♂️', '👼', '🤰', '🤱', '👩‍🍼', '🧑‍🍼', '👨‍🍼', '🙇‍♀️', '🙇', '🙇‍♂️', '💁‍♀️', '💁', '💁‍♂️', '🙅‍♀️', '🙅', '🙅‍♂️', '🙆‍♀️', '🙆', '🙆‍♂️', '🙋‍♀️', '🙋', '🙋‍♂️', '🧏‍♀️', '🧏', '🧏‍♂️', '🤦‍♀️', '🤦', '🤦‍♂️', '🤷‍♀️', '🤷', '🤷‍♂️'],
  },
  {
    name: 'Gestures',
    icon: 'hand-left-outline',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '👣', '🫂', '👤', '👥', '🗣️', '👶', '🧒', '👦', '👧'],
  },
  {
    name: 'Hearts',
    icon: 'heart-outline',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭'],
  },
  {
    name: 'Animals',
    icon: 'paw-outline',
    emojis: ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠'],
  },
  {
    name: 'Food',
    icon: 'fast-food-outline',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂'],
  },
  {
    name: 'Activities',
    icon: 'football-outline',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
  },
  {
    name: 'Travel',
    icon: 'airplane-outline',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'],
  },
  {
    name: 'Objects',
    icon: 'bulb-outline',
    emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓'],
  },
  {
    name: 'Symbols',
    icon: 'star-outline',
    emojis: ['⭐', '🌟', '✨', '💫', '🔥', '💥', '💢', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '✅', '❌', '❓', '❗', '‼️', '⁉️', '💯', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢'],
  },
  {
    name: 'Flags',
    icon: 'flag-outline',
    emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇬🇭', '🇫🇷', '🇬🇧', '🇺🇸', '🇨🇦', '🇩🇪', '🇪🇸', '🇮🇹', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇧🇷', '🇲🇽', '🇦🇺', '🇳🇬', '🇿🇦', '🇰🇪', '🇪🇬', '🇷🇺', '🇸🇦', '🇦🇪', '🇹🇷', '🇮🇱', '🇵🇰', '🇧🇩', '🇮🇩', '🇵🇭', '🇻🇳', '🇹🇭', '🇲🇾', '🇸🇬', '🇳🇿', '🇦🇷', '🇨🇴', '🇨🇱', '🇵🇪', '🇻🇪', '🇪🇨', '🇧🇴', '🇵🇾', '🇺🇾', '🇨🇺', '🇯🇲', '🇭🇹', '🇩🇴', '🇵🇷', '🇵🇦', '🇨🇷', '🇬🇹', '🇭🇳', '🇳🇮', '🇸🇻', '🇧🇿', '🇵🇱', '🇺🇦', '🇨🇿', '🇦🇹', '🇨🇭', '🇧🇪', '🇳🇱', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇮🇪', '🇵🇹', '🇬🇷', '🇷🇴', '🇭🇺', '🇸🇰', '🇧🇬', '🇭🇷', '🇷🇸', '🇸🇮', '🇧🇦', '🇲🇰', '🇦🇱', '🇲🇪', '🇽🇰', '🇱🇹', '🇱🇻', '🇪🇪', '🇧🇾', '🇲🇩', '🇬🇪', '🇦🇲', '🇦🇿', '🇰🇿', '🇺🇿', '🇹🇲', '🇰🇬', '🇹🇯', '🇲🇳', '🇦🇫', '🇮🇷', '🇮🇶', '🇸🇾', '🇯🇴', '🇱🇧', '🇰🇼', '🇶🇦', '🇧🇭', '🇴🇲', '🇾🇪', '🇲🇦', '🇩🇿', '🇹🇳', '🇱🇾', '🇸🇩', '🇸🇸', '🇪🇹', '🇪🇷', '🇩🇯', '🇸🇴', '🇺🇬', '🇹🇿', '🇷🇼', '🇧🇮', '🇨🇩', '🇨🇬', '🇨🇫', '🇨🇲', '🇬🇦', '🇬🇶', '🇸🇹', '🇦🇴', '🇿🇲', '🇿🇼', '🇲🇿', '🇲🇼', '🇧🇼', '🇳🇦', '🇱🇸', '🇸🇿', '🇲🇬', '🇲🇺', '🇸🇨', '🇰🇲', '🇷🇪', '🇾🇹', '🇸🇳', '🇬🇲', '🇬🇼', '🇬🇳', '🇸🇱', '🇱🇷', '🇨🇮', '🇧🇫', '🇲🇱', '🇳🇪', '🇹🇬', '🇧🇯', '🇲🇷', '🇨🇻'],
  },
];

const formatTimeAgo = (date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInSeconds = Math.floor((now - messageDate) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const detectURL = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex);
};

const getFileIcon = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return { icon: 'document-text', color: '#E53935' };
    case 'doc':
    case 'docx': return { icon: 'document', color: '#1976D2' };
    case 'xls':
    case 'xlsx': return { icon: 'grid', color: '#2E7D32' };
    case 'ppt':
    case 'pptx': return { icon: 'easel', color: '#F57C00' };
    case 'zip':
    case 'rar': return { icon: 'archive', color: '#795548' };
    case 'mp3':
    case 'wav': return { icon: 'musical-notes', color: '#9C27B0' };
    case 'mp4':
    case 'mov': return { icon: 'videocam', color: '#00BCD4' };
    default: return { icon: 'document-attach', color: '#607D8B' };
  }
};

export default function StudyGroupDetailScreen({ route, navigation }) {
  const { groupId, initialTab = 'discussions' } = route.params;
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [discussionMessage, setDiscussionMessage] = useState('');
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'link' });

  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMessageActions, setShowMessageActions] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messageActionsAnim = useRef(new Animated.Value(0)).current;
  const [messageReactions, setMessageReactions] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [doubleTapHeartIndex, setDoubleTapHeartIndex] = useState(null);
  const doubleTapHeartAnim = useRef(new Animated.Value(0)).current;

  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingVoice, setPlayingVoice] = useState(null);
  const [voiceProgress, setVoiceProgress] = useState({});
  const [soundObject, setSoundObject] = useState(null);
  const recordingTimerRef = useRef(null);
  const recordingAnimRef = useRef(new Animated.Value(1)).current;

  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const callTimerRef = useRef(null);
  const callPulseAnim = useRef(new Animated.Value(1)).current;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const groupInfoAnim = useRef(new Animated.Value(0)).current;
  const [editGroupData, setEditGroupData] = useState({
    name: '',
    description: '',
    level: 'all',
    focus: 'general',
    maxMembers: 20,
    isPrivate: false,
    image: null,
  });
  const [editGroupImageLoading, setEditGroupImageLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    mentions: true,
    calls: true,
    muted: false,
    muteDuration: null,
  });
  const groupOptionsAnim = useRef(new Animated.Value(0)).current;

  const attachmentMenuAnim = useRef(new Animated.Value(0)).current;
  const reactionPickerAnim = useRef(new Animated.Value(0)).current;
  const discussionsScrollRef = useRef(null);

  useEffect(() => {
    loadGroup();
  }, [groupId, user?._id]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (soundObject) {
        soundObject.unloadAsync().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    setShowMessageActions(false);
    setSelectedMessage(null);
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      if (groupId) {
        loadGroup();
      }
    }, [groupId, user?._id])
  );

  // Calculate member count from group data
  const memberCount = group?.members?.length || 0;

  useEffect(() => {
    Animated.spring(attachmentMenuAnim, {
      toValue: showAttachmentMenu ? 1 : 0,
      tension: 65,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [showAttachmentMenu]);

  useEffect(() => {
    Animated.spring(reactionPickerAnim, {
      toValue: showReactionPicker ? 1 : 0,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [showReactionPicker]);

  const loadGroup = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await studyGroupsAPI.getById(groupId);
      const groupData = response.data.data;
      setGroup(groupData);

      if (groupData.discussions) {
        const reactionsMap = {};
        groupData.discussions.forEach((discussion) => {
          if (discussion.reactions && discussion.reactions.length > 0) {
            reactionsMap[discussion._id.toString()] = discussion.reactions.map(r => ({
              emoji: r.emoji,
              userId: typeof r.user === 'object' ? r.user._id : r.user
            }));
          }
        });
        setMessageReactions(reactionsMap);
      }
    } catch (error) {
      console.error('Failed to load study group:', error);
      setError('Failed to load study group. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroup();
  };

  const isMember = () => {
    if (!user || !group) return false;

    const userId = user._id
      ? (typeof user._id === 'object' ? String(user._id) : String(user._id))
      : (user.id ? String(user.id) : null);

    if (!userId) return false;

    let creatorId = null;
    if (group.creator) {
      if (typeof group.creator === 'object' && group.creator !== null) {
        creatorId = group.creator._id
          ? String(group.creator._id)
          : (group.creator.id ? String(group.creator.id) : String(group.creator));
      } else {
        creatorId = String(group.creator);
      }
    }

    if (creatorId && creatorId === userId) {
      return true;
    }

    const inMembers = group.members?.some(member => {
      if (!member || !member.user) return false;

      let memberId = null;
      if (typeof member.user === 'object' && member.user !== null) {
        memberId = member.user._id
          ? String(member.user._id)
          : (member.user.id ? String(member.user.id) : String(member.user));
      } else {
        memberId = String(member.user);
      }

      return memberId === userId;
    });

    return inMembers || false;
  };

  const isModerator = () => {
    if (!user || !group) return false;

    const userId = user._id
      ? (typeof user._id === 'object' ? String(user._id) : String(user._id))
      : (user.id ? String(user.id) : null);

    if (!userId) return false;

    let creatorId = null;
    if (group.creator) {
      if (typeof group.creator === 'object' && group.creator !== null) {
        creatorId = group.creator._id
          ? String(group.creator._id)
          : (group.creator.id ? String(group.creator.id) : String(group.creator));
      } else {
        creatorId = String(group.creator);
      }
    }

    if (creatorId && creatorId === userId) {
      return true;
    }

    return group.members?.some(member => {
      if (!member || !member.user) return false;

      let memberId = null;
      if (typeof member.user === 'object' && member.user !== null) {
        memberId = member.user._id
          ? String(member.user._id)
          : (member.user.id ? String(member.user.id) : String(member.user));
      } else {
        memberId = String(member.user);
      }

      return memberId === userId && member.role === 'moderator';
    }) || false;
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to join this study group');
      navigation.navigate('Auth');
      return;
    }

    if (group.isPrivate) {
      setShowJoinModal(true);
    } else {
      try {
        await studyGroupsAPI.join(groupId);
        Alert.alert('Success', 'You have successfully joined the study group!');
        loadGroup();
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to join study group');
      }
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinInviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      await studyGroupsAPI.join(groupId, joinInviteCode);
      Alert.alert('Success', 'You have successfully joined the study group!');
      setShowJoinModal(false);
      setJoinInviteCode('');
      loadGroup();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid invite code');
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this study group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await studyGroupsAPI.leave(groupId);
              Alert.alert('Success', 'You have left the study group');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const handleSendMessage = async () => {
    const hasContent = discussionMessage.trim() || selectedImage || selectedDocument;
    if (!hasContent) return;

    try {
      setSendingMessage(true);

      let messageData = {
        message: discussionMessage.trim(),
        type: MESSAGE_TYPES.TEXT,
      };

      if (selectedImage) {
        messageData.type = MESSAGE_TYPES.IMAGE;
        messageData.attachment = {
          type: 'image',
          uri: selectedImage.uri,
          name: selectedImage.fileName || 'image.jpg',
        };
      }

      if (selectedDocument) {
        messageData.type = MESSAGE_TYPES.DOCUMENT;
        messageData.attachment = {
          type: 'document',
          uri: selectedDocument.uri,
          name: selectedDocument.name,
          size: selectedDocument.size,
        };
      }

      if (replyingTo) {
        messageData.replyTo = {
          id: replyingTo._id || replyingTo.id,
          userName: replyingTo.user?.name || 'Member',
          message: replyingTo.message?.substring(0, 50) + (replyingTo.message?.length > 50 ? '...' : ''),
        };
      }

      const urls = detectURL(discussionMessage);
      if (urls && urls.length > 0 && !selectedImage && !selectedDocument) {
        messageData.type = MESSAGE_TYPES.LINK;
        messageData.links = urls;
      }

      await studyGroupsAPI.addDiscussion(groupId, JSON.stringify(messageData));

      setDiscussionMessage('');
      setSelectedImage(null);
      setSelectedDocument(null);
      setReplyingTo(null);
      setShowAttachmentMenu(false);

      loadGroup();

      setTimeout(() => {
        discussionsScrollRef.current?.scrollToEnd({ animated: true });
      }, 300);

    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const startRecording = async () => {
    // Prevent multiple rapid taps
    if (isRecording) return;
    
    try {
      // Clean up any existing recording first
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) {
          // Ignore errors
        }
        setRecording(null);
      }
      
      // Clear any existing timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Stop any playing audio
      if (soundObject) {
        try {
          await soundObject.stopAsync();
          await soundObject.unloadAsync();
        } catch (e) {
          // Ignore errors
        }
        setSoundObject(null);
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your microphone');
        return;
      }

      // Reset audio mode first
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now set for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimRef, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(recordingAnimRef, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      // Reset state on error
      setRecording(null);
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const sendVoiceMessage = async () => {
    try {
      if (!recording) return;

      clearInterval(recordingTimerRef.current);
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const messageData = {
        message: `Voice message (${recordingDuration}s)`,
        type: MESSAGE_TYPES.VOICE,
        attachment: {
          type: 'voice',
          uri: uri,
          duration: recordingDuration,
        },
      };

      await studyGroupsAPI.addDiscussion(groupId, JSON.stringify(messageData));

      setRecording(null);
      setRecordingDuration(0);
      loadGroup();

    } catch (error) {
      console.error('Failed to send voice message:', error);
      Alert.alert('Error', 'Failed to send voice message');
    }
  };

  const playVoiceMessage = async (uri, messageId) => {
    try {
      if (soundObject) {
        await soundObject.unloadAsync();
        setSoundObject(null);
        if (playingVoice === messageId) {
          setPlayingVoice(null);
          return;
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            const progress = status.positionMillis / status.durationMillis;
            setVoiceProgress(prev => ({ ...prev, [messageId]: progress }));
            if (status.didJustFinish) {
              setPlayingVoice(null);
              setVoiceProgress(prev => ({ ...prev, [messageId]: 0 }));
            }
          }
        }
      );

      setSoundObject(sound);
      setPlayingVoice(messageId);

    } catch (error) {
      console.error('Failed to play voice message:', error);
      Alert.alert('Error', 'Failed to play voice message');
    }
  };

  const handleAddResource = async () => {
    if (!newResource.title.trim() || !newResource.url.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await studyGroupsAPI.addResource(groupId, {
        title: newResource.title.trim(),
        url: newResource.url.trim(),
        type: newResource.type,
      });

      Alert.alert('Success', 'Resource added successfully');
      setNewResource({ title: '', url: '', type: 'link' });
      setShowResourceModal(false);
      loadGroup();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add resource');
    }
  };

  const startCall = (type) => {
    setCallType(type);
    setIsInCall(true);
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
    setIsVideoOn(type === 'video');

    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(callPulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(callPulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const endCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    setIsInCall(false);
    setCallType(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
    setIsVideoOn(true);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(prev => !prev);
  };

  const toggleVideo = () => {
    setIsVideoOn(prev => !prev);
  };

  const toggleCamera = () => {
    setIsFrontCamera(prev => !prev);
  };

  const openMessageActions = (message, index, isOwnMessage) => {
    setSelectedMessage({ ...message, index, isOwnMessage });
    setShowMessageActions(true);
    Animated.spring(messageActionsAnim, {
      toValue: 1,
      tension: 65,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const closeMessageActions = () => {
    Animated.timing(messageActionsAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowMessageActions(false);
      setSelectedMessage(null);
    });
  };

  const openGroupOptions = () => {
    setShowGroupOptions(true);
    Animated.spring(groupOptionsAnim, {
      toValue: 1,
      tension: 65,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const closeGroupOptions = () => {
    Animated.timing(groupOptionsAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowGroupOptions(false);
    });
  };

  const openGroupInfo = () => {
    setShowGroupInfo(true);
    Animated.spring(groupInfoAnim, {
      toValue: 1,
      tension: 65,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const openEditGroup = () => {
    setEditGroupData({
      name: group?.name || '',
      description: group?.description || '',
      level: group?.level || 'all',
      focus: group?.focus || 'general',
      maxMembers: group?.maxMembers || 20,
      isPrivate: group?.isPrivate || false,
      image: group?.image || null,
    });
    setShowGroupOptions(false);
    setShowEditGroup(true);
  };

  const closeGroupInfo = () => {
    Animated.timing(groupInfoAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowGroupInfo(false);
    });
  };

  const handleCopyInviteCode = async () => {
    try {
      await Clipboard.setStringAsync(group?.inviteCode || groupId);
      Alert.alert('Copied!', 'Invite code copied to clipboard');
      closeGroupOptions();
    } catch (error) {
      Alert.alert('Error', 'Failed to copy invite code');
    }
  };

  const handleShareGroup = async () => {
    try {
      await Sharing.shareAsync(group?.inviteCode || `Join my study group: ${group?.name}`);
      closeGroupOptions();
    } catch (error) {
      console.log('Share cancelled or failed');
    }
  };

  const handleReportGroup = () => {
    Alert.alert(
      'Report Group',
      'Are you sure you want to report this group for inappropriate content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Reported', 'Thank you for your report. We will review this group.');
            closeGroupOptions();
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await studyGroupsAPI.delete(groupId);
              Alert.alert('Deleted', 'Study group has been deleted');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  const handleSaveGroupEdit = async () => {
    try {
      // For now, just close the modal - implement API call when backend supports it
      Alert.alert('Saved', 'Group settings updated successfully');
      setShowEditGroup(false);
      loadGroup();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update group');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Change Group Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleMuteGroup = (duration) => {
    setNotificationSettings(prev => ({
      ...prev,
      muted: duration !== null,
      muteDuration: duration,
    }));
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const cancelAttachment = () => {
    setSelectedImage(null);
    setSelectedDocument(null);
  };

  const openImagePreview = (uri) => {
    setPreviewImage(uri);
    setShowImagePreview(true);
  };

  const handleSwipeDelete = (discussion, isOwnMessage) => {
    if (!isOwnMessage && !isModerator()) return;
    
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await studyGroupsAPI.deleteDiscussion(groupId, discussion._id);
              loadGroup();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const handleDoubleTapLike = async (index, reaction) => {
    setDoubleTapHeartIndex(index);
    Animated.sequence([
      Animated.timing(doubleTapHeartAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(doubleTapHeartAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDoubleTapHeartIndex(null);
    });
    
    // Add reaction to message
    handleReaction(index, reaction);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const insertEmoji = (emoji) => {
    setDiscussionMessage(prev => prev + emoji);
  };

  const cancelRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      clearInterval(recordingTimerRef.current);
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  };

  const handleReplyToMessage = () => {
    if (selectedMessage) {
      setReplyingTo(selectedMessage);
      closeMessageActions();
    }
  };

  const handleCopyMessage = async () => {
    try {
      await Clipboard.setStringAsync(selectedMessage?.message || selectedMessage?.content || '');
      closeMessageActions();
      Alert.alert('Copied', 'Message copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy message');
    }
  };

  const handleForwardMessage = () => {
    Alert.alert('Forward', 'Forward functionality coming soon');
    closeMessageActions();
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;
    
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await studyGroupsAPI.deleteDiscussion(groupId, selectedMessage._id);
              loadGroup();
              closeMessageActions();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const handleReportMessage = () => {
    Alert.alert(
      'Report Message',
      'Are you sure you want to report this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Reported', 'Thank you for your report. We will review this message.');
            closeMessageActions();
          },
        },
      ]
    );
  };

  const handleReaction = async (messageIndex, reaction) => {
    try {
      const discussion = group?.discussions?.[messageIndex];
      if (!discussion) return;

      await studyGroupsAPI.reactToDiscussion(groupId, discussion._id, reaction.emoji);
      
      setMessageReactions(prev => {
        const messageId = discussion._id.toString();
        const existingReactions = prev[messageId] || [];
        const userReactionIndex = existingReactions.findIndex(
          r => r.userId === user?._id && r.emoji === reaction.emoji
        );
        
        if (userReactionIndex >= 0) {
          return {
            ...prev,
            [messageId]: existingReactions.filter((_, i) => i !== userReactionIndex),
          };
        } else {
          return {
            ...prev,
            [messageId]: [...existingReactions, { emoji: reaction.emoji, userId: user?._id }],
          };
        }
      });
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setSelectedDocument(null);
        setShowAttachmentMenu(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setSelectedDocument(null);
        setShowAttachmentMenu(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });
      if (result.type === 'success') {
        console.log('Document picked:', result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const renderVoiceCallModal = () => (
    <Modal visible={showVoiceCall} animationType="fade" statusBarTranslucent>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#6B8DD6']}
        style={styles.callBackground}
      >
        <View style={styles.voiceCallContainer}>
          <Animated.View style={[styles.callAvatarContainer, { transform: [{ scale: callPulseAnim }] }]}>
            <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.callAvatarRing}>
              <View style={styles.callAvatar}>
                <Ionicons name="people" size={50} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </Animated.View>
          <Text style={styles.callGroupName}>{group?.name}</Text>
          <Text style={styles.callStatus}>
            {callDuration > 0 ? formatCallDuration(callDuration) : 'Connecting...'}
          </Text>
          <View style={styles.callParticipants}>
            <Text style={styles.callParticipantsText}>{memberCount} participants</Text>
          </View>
        </View>

                <View style={styles.callControls}>
                  <View style={styles.callControlsRow}>
                    <TouchableOpacity style={[styles.callControlBtn, isMuted && styles.callControlBtnActive]} onPress={toggleMute}>
                      <Ionicons name={isMuted ? "mic-off" : "mic"} size={26} color="#FFFFFF" />
                      <Text style={styles.callControlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.callControlBtn, isSpeakerOn && styles.callControlBtnActive]} onPress={toggleSpeaker}>
                      <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={26} color="#FFFFFF" />
                      <Text style={styles.callControlLabel}>{isSpeakerOn ? 'Speaker' : 'Phone'}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
                    <LinearGradient colors={['#FF3B30', '#FF453A']} style={styles.endCallBtnGradient}>
                      <Ionicons name="call" size={30} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
        </Modal>
  );

  const renderGroupOptionsModal = () => (
        <Modal
          visible={showGroupOptions}
          transparent={true}
          animationType="none"
          onRequestClose={closeGroupOptions}
        >
          <TouchableOpacity
            style={styles.actionSheetOverlay}
            activeOpacity={1}
            onPress={closeGroupOptions}
          >
            <Animated.View
              style={[
                styles.actionSheetContainer,
                {
                  transform: [{
                    translateY: groupOptionsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    })
                  }]
                }
              ]}
            >

              <View style={[styles.actionSheetHeader, { backgroundColor: colors.card }]}>
                <View style={[styles.actionSheetGroupInfo, { backgroundColor: colors.card }]}>
                  {group?.image ? (
                    <Image source={{ uri: group.image }} style={styles.actionSheetGroupAvatarImage} />
                  ) : (
                    <View style={[styles.actionSheetGroupAvatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
                      <Ionicons name="people" size={28} color={premiumColors.primary.main} />
                    </View>
                  )}
                  <View style={styles.actionSheetGroupDetails}>
                    <Text style={[styles.actionSheetGroupName, { color: colors.text }]}>{group?.name}</Text>
                    <Text style={[styles.actionSheetGroupMeta, { color: colors.secondaryText }]}>
                      {memberCount} members • {group?.isPrivate ? 'Private' : 'Public'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.actionSheetSection, { backgroundColor: colors.card }]}>
                {isModerator() && (
                  <TouchableOpacity style={styles.actionSheetItem} onPress={openEditGroup}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: '#007AFF20' }]}>
                      <Ionicons name="pencil" size={20} color="#007AFF" />
                    </View>
                    <Text style={[styles.actionSheetItemText, { color: colors.text }]}>Edit Group</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionSheetItem} onPress={handleCopyInviteCode}>
                  <View style={[styles.actionSheetIcon, { backgroundColor: '#34C75920' }]}>
                    <Ionicons name="link" size={20} color="#34C759" />
                  </View>
                  <Text style={[styles.actionSheetItemText, { color: colors.text }]}>Copy Invite Link</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionSheetItem} onPress={handleShareGroup}>
                  <View style={[styles.actionSheetIcon, { backgroundColor: '#5856D620' }]}>
                    <Ionicons name="share-outline" size={20} color="#5856D6" />
                  </View>
                  <Text style={[styles.actionSheetItemText, { color: colors.text }]}>Share Group</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <View style={[styles.actionSheetSection, { backgroundColor: colors.card }]}>
                <TouchableOpacity style={styles.actionSheetItem} onPress={() => setShowNotificationSettings(true)}>
                  <View style={[styles.actionSheetIcon, { backgroundColor: '#FF3B3020' }]}>
                    <Ionicons name="notifications-outline" size={20} color="#FF3B30" />
                  </View>
                  <Text style={[styles.actionSheetItemText, { color: colors.text }]}>Notifications</Text>
                  <Text style={[styles.actionSheetItemValue, { color: colors.secondaryText }]}>
                    {notificationSettings.muted ? 'Muted' : 'On'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionSheetItem}
                  onPress={() => handleMuteGroup(notificationSettings.muted ? null : '8 hours')}
                >
                  <View style={[styles.actionSheetIcon, { backgroundColor: '#8E8E9320' }]}>
                    <Ionicons name={notificationSettings.muted ? "volume-high" : "volume-mute"} size={20} color="#8E8E93" />
                  </View>
                  <Text style={[styles.actionSheetItemText, { color: colors.text }]}>
                    {notificationSettings.muted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.actionSheetSection, { backgroundColor: colors.card }]}>
                <TouchableOpacity style={styles.actionSheetItem} onPress={handleReportGroup}>
                  <View style={[styles.actionSheetIcon, { backgroundColor: '#FF950020' }]}>
                    <Ionicons name="flag-outline" size={20} color="#FF9500" />
                  </View>
                  <Text style={[styles.actionSheetItemText, { color: '#FF9500' }]}>Report Group</Text>
                </TouchableOpacity>

                {isMember() && !isModerator() && (
                  <TouchableOpacity style={styles.actionSheetItem} onPress={handleLeave}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: '#FF3B3020' }]}>
                      <Ionicons name="exit-outline" size={20} color="#FF3B30" />
                    </View>
                    <Text style={[styles.actionSheetItemText, { color: '#FF3B30' }]}>Leave Group</Text>
                  </TouchableOpacity>
                )}

                {isModerator() && (
                  <TouchableOpacity style={styles.actionSheetItem} onPress={handleDeleteGroup}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: '#FF3B3020' }]}>
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </View>
                    <Text style={[styles.actionSheetItemText, { color: '#FF3B30' }]}>Delete Group</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.actionSheetCancelBtn, { backgroundColor: colors.card }]}
                onPress={closeGroupOptions}
              >
                <Text style={[styles.actionSheetCancelText, { color: '#007AFF' }]}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
  );

  const renderEditGroupModal = () => (
        <Modal
          visible={showEditGroup}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowEditGroup(false)}
        >
          <View style={[styles.editGroupModal, { backgroundColor: colors.background }]}>

            <View style={[styles.editGroupHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowEditGroup(false)}>
                <Text style={[styles.editGroupCancelBtn, { color: '#007AFF' }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.editGroupTitle, { color: colors.text }]}>Edit Group</Text>
              <TouchableOpacity onPress={handleSaveGroupEdit} disabled={editGroupImageLoading}>
                {editGroupImageLoading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={[styles.editGroupSaveBtn, { color: '#007AFF' }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editGroupContent} showsVerticalScrollIndicator={false}>

              <View style={styles.editGroupPhotoSection}>
                <TouchableOpacity onPress={showImageOptions} activeOpacity={0.8}>
                  {editGroupData.image ? (
                    <View style={styles.editGroupPhotoContainer}>
                      <Image
                        source={{ uri: editGroupData.image }}
                        style={styles.editGroupPhotoImage}
                      />
                      <View style={styles.editGroupPhotoOverlay}>
                        <Ionicons name="camera" size={24} color="#FFFFFF" />
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.editGroupPhoto, { backgroundColor: premiumColors.primary.main + '20' }]}>
                      <Ionicons name="people" size={50} color={premiumColors.primary.main} />
                      <View style={styles.editGroupPhotoOverlay}>
                        <Ionicons name="camera" size={24} color="#FFFFFF" />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.editGroupPhotoBtn} onPress={showImageOptions}>
                  <Text style={[styles.editGroupPhotoBtnText, { color: '#007AFF' }]}>
                    {editGroupData.image ? 'Change Photo' : 'Add Photo'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.editGroupSection, { backgroundColor: colors.card }]}>
                <Text style={[styles.editGroupSectionTitle, { color: colors.secondaryText }]}>GROUP INFO</Text>

                <View style={[styles.editGroupField, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.editGroupFieldLabel, { color: colors.secondaryText }]}>Name</Text>
                  <TextInput
                    style={[styles.editGroupFieldInput, { color: colors.text }]}
                    value={editGroupData.name}
                    onChangeText={(text) => setEditGroupData(prev => ({ ...prev, name: text }))}
                    placeholder="Group Name"
                    placeholderTextColor={colors.secondaryText}
                  />
                </View>

                <View style={styles.editGroupField}>
                  <Text style={[styles.editGroupFieldLabel, { color: colors.secondaryText }]}>Description</Text>
                  <TextInput
                    style={[styles.editGroupFieldInput, styles.editGroupFieldMultiline, { color: colors.text }]}
                    value={editGroupData.description}
                    onChangeText={(text) => setEditGroupData(prev => ({ ...prev, description: text }))}
                    placeholder="Describe your group"
                    placeholderTextColor={colors.secondaryText}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              <View style={[styles.editGroupSection, { backgroundColor: colors.card }]}>
                <Text style={[styles.editGroupSectionTitle, { color: colors.secondaryText }]}>SETTINGS</Text>

                <View style={[styles.editGroupField, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.editGroupFieldLabel, { color: colors.text }]}>Level</Text>
                  <View style={styles.editGroupOptionsRow}>
                    {['beginner', 'intermediate', 'advanced', 'all'].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.editGroupOption,
                          { borderColor: colors.border },
                          editGroupData.level === level && { backgroundColor: premiumColors.primary.main, borderColor: premiumColors.primary.main }
                        ]}
                        onPress={() => setEditGroupData(prev => ({ ...prev, level }))}
                      >
                        <Text style={[
                          styles.editGroupOptionText,
                          { color: colors.secondaryText },
                          editGroupData.level === level && { color: '#FFFFFF' }
                        ]}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.editGroupField, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.editGroupFieldLabel, { color: colors.text }]}>Focus</Text>
                  <View style={styles.editGroupOptionsRow}>
                    {['grammar', 'conversation', 'vocabulary', 'general'].map((focus) => (
                      <TouchableOpacity
                        key={focus}
                        style={[
                          styles.editGroupOption,
                          { borderColor: colors.border },
                          editGroupData.focus === focus && { backgroundColor: premiumColors.primary.main, borderColor: premiumColors.primary.main }
                        ]}
                        onPress={() => setEditGroupData(prev => ({ ...prev, focus }))}
                      >
                        <Text style={[
                          styles.editGroupOptionText,
                          { color: colors.secondaryText },
                          editGroupData.focus === focus && { color: '#FFFFFF' }
                        ]}>
                          {focus.charAt(0).toUpperCase() + focus.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.editGroupField, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.editGroupFieldLabel, { color: colors.text }]}>Max Members</Text>
                  <View style={styles.editGroupSliderRow}>
                    <TouchableOpacity
                      style={[styles.editGroupSliderBtn, { backgroundColor: colors.border }]}
                      onPress={() => setEditGroupData(prev => ({ ...prev, maxMembers: Math.max(5, prev.maxMembers - 5) }))}
                    >
                      <Ionicons name="remove" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.editGroupSliderValue, { color: colors.text }]}>{editGroupData.maxMembers}</Text>
                    <TouchableOpacity
                      style={[styles.editGroupSliderBtn, { backgroundColor: colors.border }]}
                      onPress={() => setEditGroupData(prev => ({ ...prev, maxMembers: Math.min(100, prev.maxMembers + 5) }))}
                    >
                      <Ionicons name="add" size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.editGroupToggleField}>
                  <View style={styles.editGroupToggleInfo}>
                    <Ionicons name="lock-closed" size={22} color={colors.text} />
                    <View style={styles.editGroupToggleText}>
                      <Text style={[styles.editGroupToggleLabel, { color: colors.text }]}>Private Group</Text>
                      <Text style={[styles.editGroupToggleDesc, { color: colors.secondaryText }]}>
                        Only invited members can join
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.editGroupToggle,
                      { backgroundColor: editGroupData.isPrivate ? '#34C759' : colors.border }
                    ]}
                    onPress={() => setEditGroupData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                  >
                    <Animated.View style={[
                      styles.editGroupToggleThumb,
                      { marginLeft: editGroupData.isPrivate ? 22 : 2 }
                    ]} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.editGroupSection, { backgroundColor: colors.card }]}>
                <Text style={[styles.editGroupSectionTitle, { color: '#FF3B30' }]}>DANGER ZONE</Text>

                <TouchableOpacity style={styles.editGroupDangerBtn} onPress={handleDeleteGroup}>
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                  <Text style={styles.editGroupDangerBtnText}>Delete Group</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 50 }} />
            </ScrollView>
          </View>
        </Modal>
  );

  const renderGroupInfoModal = () => (
        <Modal
          visible={showGroupInfo}
          transparent={true}
          animationType="none"
          onRequestClose={closeGroupInfo}
        >
          <View style={styles.groupInfoOverlay}>
            <TouchableOpacity style={styles.groupInfoBackdrop} activeOpacity={1} onPress={closeGroupInfo} />
            <Animated.View
              style={[
                styles.groupInfoContainer,
                { backgroundColor: colors.card },
                {
                  transform: [{
                    translateY: groupInfoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height, 0],
                    })
                  }]
                }
              ]}
            >

              <View style={styles.groupInfoHandle}>
                <View style={[styles.groupInfoHandleBar, { backgroundColor: colors.border }]} />
              </View>

              <View style={styles.groupInfoHeader}>
                {group?.image ? (
                  <Image source={{ uri: group.image }} style={styles.groupInfoAvatarImage} />
                ) : (
                  <View style={[styles.groupInfoAvatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
                    <Ionicons name="people" size={40} color={premiumColors.primary.main} />
                  </View>
                )}
                <Text style={[styles.groupInfoName, { color: colors.text }]}>{group?.name}</Text>
                <Text style={[styles.groupInfoDesc, { color: colors.secondaryText }]} numberOfLines={2}>
                  {group?.description}
                </Text>

                <View style={styles.groupInfoStats}>
                  <View style={styles.groupInfoStat}>
                    <Text style={[styles.groupInfoStatValue, { color: colors.text }]}>{memberCount}</Text>
                    <Text style={[styles.groupInfoStatLabel, { color: colors.secondaryText }]}>Members</Text>
                  </View>
                  <View style={[styles.groupInfoStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.groupInfoStat}>
                    <Text style={[styles.groupInfoStatValue, { color: colors.text }]}>
                      {group?.discussions?.length || 0}
                    </Text>
                    <Text style={[styles.groupInfoStatLabel, { color: colors.secondaryText }]}>Messages</Text>
                  </View>
                  <View style={[styles.groupInfoStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.groupInfoStat}>
                    <Text style={[styles.groupInfoStatValue, { color: colors.text }]}>
                      {group?.resources?.length || 0}
                    </Text>
                    <Text style={[styles.groupInfoStatLabel, { color: colors.secondaryText }]}>Resources</Text>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.groupInfoScroll} showsVerticalScrollIndicator={false}>

                <View style={[styles.groupInfoSection, { backgroundColor: colors.background }]}>
                  <Text style={[styles.groupInfoSectionTitle, { color: colors.secondaryText }]}>DETAILS</Text>

                  <View style={styles.groupInfoRow}>
                    <View style={[styles.groupInfoRowIcon, { backgroundColor: '#007AFF20' }]}>
                      <Ionicons name="school" size={18} color="#007AFF" />
                    </View>
                    <View style={styles.groupInfoRowContent}>
                      <Text style={[styles.groupInfoRowLabel, { color: colors.secondaryText }]}>Level</Text>
                      <Text style={[styles.groupInfoRowValue, { color: colors.text }]}>
                        {group?.level ? group.level.charAt(0).toUpperCase() + group.level.slice(1) : 'All Levels'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.groupInfoRow}>
                    <View style={[styles.groupInfoRowIcon, { backgroundColor: '#34C75920' }]}>
                      <Ionicons name="bookmark" size={18} color="#34C759" />
                    </View>
                    <View style={styles.groupInfoRowContent}>
                      <Text style={[styles.groupInfoRowLabel, { color: colors.secondaryText }]}>Focus</Text>
                      <Text style={[styles.groupInfoRowValue, { color: colors.text }]}>
                        {group?.focus ? group.focus.charAt(0).toUpperCase() + group.focus.slice(1) : 'General'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.groupInfoRow}>
                    <View style={[styles.groupInfoRowIcon, { backgroundColor: '#FF950020' }]}>
                      <Ionicons name={group?.isPrivate ? "lock-closed" : "globe"} size={18} color="#FF9500" />
                    </View>
                    <View style={styles.groupInfoRowContent}>
                      <Text style={[styles.groupInfoRowLabel, { color: colors.secondaryText }]}>Privacy</Text>
                      <Text style={[styles.groupInfoRowValue, { color: colors.text }]}>
                        {group?.isPrivate ? 'Private Group' : 'Public Group'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.groupInfoRow}>
                    <View style={[styles.groupInfoRowIcon, { backgroundColor: '#5856D620' }]}>
                      <Ionicons name="calendar" size={18} color="#5856D6" />
                    </View>
                    <View style={styles.groupInfoRowContent}>
                      <Text style={[styles.groupInfoRowLabel, { color: colors.secondaryText }]}>Created</Text>
                      <Text style={[styles.groupInfoRowValue, { color: colors.text }]}>
                        {group?.createdAt ? new Date(group.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        }) : 'Unknown'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.groupInfoSection, { backgroundColor: colors.background }]}>
                  <View style={styles.groupInfoSectionHeader}>
                    <Text style={[styles.groupInfoSectionTitle, { color: colors.secondaryText }]}>MEMBERS</Text>
                    <TouchableOpacity onPress={() => { closeGroupInfo(); setActiveTab('members'); }}>
                      <Text style={[styles.groupInfoSeeAll, { color: premiumColors.primary.main }]}>See All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.groupInfoMembersList}>
                    {group?.members?.slice(0, 5).map((m, idx) => {
                      const memberUser = typeof m.user === 'object' ? m.user : null;
                      const isCreator = memberUser?._id === (typeof group.creator === 'object' ? group.creator?._id : group.creator);
                      return (
                        <View key={idx} style={styles.groupInfoMember}>
                          {memberUser?.avatar ? (
                            <Image source={{ uri: memberUser.avatar }} style={styles.groupInfoMemberAvatar} />
                          ) : (
                            <View style={[styles.groupInfoMemberAvatarPlaceholder, { backgroundColor: premiumColors.primary.main + '20' }]}>
                              <Ionicons name="person" size={16} color={premiumColors.primary.main} />
                            </View>
                          )}
                          <View style={styles.groupInfoMemberInfo}>
                            <Text style={[styles.groupInfoMemberName, { color: colors.text }]} numberOfLines={1}>
                              {memberUser?.name || 'Member'}
                            </Text>
                            {isCreator && (
                              <Text style={[styles.groupInfoMemberRole, { color: premiumColors.accent.gold }]}>Creator</Text>
                            )}
                            {m.role === 'moderator' && !isCreator && (
                              <Text style={[styles.groupInfoMemberRole, { color: premiumColors.primary.main }]}>Moderator</Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                <View style={[styles.groupInfoSection, { backgroundColor: colors.background }]}>
                  <Text style={[styles.groupInfoSectionTitle, { color: colors.secondaryText }]}>QUICK ACTIONS</Text>

                  <View style={styles.groupInfoActions}>
                    <TouchableOpacity
                      style={[styles.groupInfoActionBtn, { backgroundColor: colors.card }]}
                      onPress={() => { closeGroupInfo(); setActiveTab('resources'); }}
                    >
                      <View style={[styles.groupInfoActionIcon, { backgroundColor: '#007AFF20' }]}>
                        <Ionicons name="folder" size={22} color="#007AFF" />
                      </View>
                      <Text style={[styles.groupInfoActionLabel, { color: colors.text }]}>Resources</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.groupInfoActionBtn, { backgroundColor: colors.card }]}
                      onPress={() => { closeGroupInfo(); setActiveTab('members'); }}
                    >
                      <View style={[styles.groupInfoActionIcon, { backgroundColor: '#34C75920' }]}>
                        <Ionicons name="people" size={22} color="#34C759" />
                      </View>
                      <Text style={[styles.groupInfoActionLabel, { color: colors.text }]}>Members</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.groupInfoActionBtn, { backgroundColor: colors.card }]}
                      onPress={() => { closeGroupInfo(); startCall('voice'); }}
                    >
                      <View style={[styles.groupInfoActionIcon, { backgroundColor: '#5856D620' }]}>
                        <Ionicons name="call" size={22} color="#5856D6" />
                      </View>
                      <Text style={[styles.groupInfoActionLabel, { color: colors.text }]}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.groupInfoActionBtn, { backgroundColor: colors.card }]}
                      onPress={() => { closeGroupInfo(); openGroupOptions(); }}
                    >
                      <View style={[styles.groupInfoActionIcon, { backgroundColor: '#FF950020' }]}>
                        <Ionicons name="settings" size={22} color="#FF9500" />
                      </View>
                      <Text style={[styles.groupInfoActionLabel, { color: colors.text }]}>Settings</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.groupInfoButtonSection}>
                  {isMember() ? (
                    <TouchableOpacity
                      style={[styles.groupInfoLeaveBtn, { borderColor: '#FF3B30' }]}
                      onPress={() => { closeGroupInfo(); handleLeave(); }}
                    >
                      <Ionicons name="exit-outline" size={20} color="#FF3B30" />
                      <Text style={styles.groupInfoLeaveBtnText}>Leave Group</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.groupInfoJoinBtn, { backgroundColor: premiumColors.primary.main }]}
                      onPress={() => { closeGroupInfo(); handleJoin(); }}
                    >
                      <Ionicons name="person-add" size={20} color="#FFFFFF" />
                      <Text style={styles.groupInfoJoinBtnText}>Join Group</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
  );

  if (loading && !group) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <LoadingSpinner />
        </View>
      </GestureHandlerRootView>
    );
  }

  if (error && !group) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <ErrorMessage message={error} onRetry={loadGroup} />
        </View>
      </GestureHandlerRootView>
    );
  }

  if (!group) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <LoadingSpinner />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: '#0B141A' }]}>
        {/* WhatsApp Style Header */}
        <View style={styles.whatsappHeader}>
          <View style={styles.whatsappHeaderLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.whatsappBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.whatsappGroupInfo}
              onPress={openGroupInfo}
            >
              {group.image ? (
                <Image source={{ uri: group.image }} style={styles.whatsappGroupAvatar} />
              ) : (
                <View style={styles.whatsappGroupAvatarPlaceholder}>
                  <Ionicons name="people" size={22} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.whatsappGroupTextContainer}>
                <Text style={styles.whatsappGroupName} numberOfLines={1}>
                  {group.name}
                </Text>
                <Text style={styles.whatsappGroupMembers}>
                  {memberCount} members · Tap for info
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.whatsappHeaderRight}>
            <TouchableOpacity 
              style={styles.whatsappHeaderIcon}
              onPress={() => startCall('voice')}
            >
              <Ionicons name="call" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.whatsappHeaderIcon}
              onPress={() => startCall('video')}
            >
              <Ionicons name="videocam" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.whatsappHeaderIcon}
              onPress={openGroupOptions}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages Area */}
        <ScrollView
          ref={discussionsScrollRef}
          style={styles.whatsappChatArea}
          contentContainerStyle={styles.whatsappChatContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#25D366" />
          }
          showsVerticalScrollIndicator={false}
        >
          {group.discussions?.length > 0 ? (
            group.discussions.map((discussion, index) => {
              const discussionUser = typeof discussion.user === 'object' ? discussion.user : null;
              const isOwnMessage = discussionUser?._id === user?._id;
              const reactions = messageReactions[discussion._id?.toString()] || [];

              let messageData;
              try {
                messageData = JSON.parse(discussion.message);
              } catch {
                messageData = { message: discussion.message, type: MESSAGE_TYPES.TEXT };
              }

              return (
                <View key={index} style={styles.messageWrapper}>
                  {/* Date Separator */}
                  {index === 0 || new Date(discussion.createdAt).toDateString() !==
                    new Date(group.discussions[index - 1]?.createdAt).toDateString() ? (
                    <View style={styles.whatsappDateSeparator}>
                      <View style={styles.whatsappDateBubble}>
                        <Text style={styles.whatsappDateText}>
                          {new Date(discussion.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                      <Swipeable
                        renderLeftActions={(progress, dragX) => {
                          const translateX = dragX.interpolate({
                            inputRange: [0, 60, 80, 100],
                            outputRange: [-40, 0, 8, 16],
                            extrapolate: 'clamp',
                          });
                          const scale = dragX.interpolate({
                            inputRange: [0, 40, 80],
                            outputRange: [0.3, 0.8, 1],
                            extrapolate: 'clamp',
                          });
                          const opacity = dragX.interpolate({
                            inputRange: [0, 30, 60],
                            outputRange: [0, 0.5, 1],
                            extrapolate: 'clamp',
                          });
                          const rotate = dragX.interpolate({
                            inputRange: [0, 80],
                            outputRange: ['-45deg', '0deg'],
                            extrapolate: 'clamp',
                          });
                          return (
                            <Animated.View
                              style={[
                                styles.swipeReplyContainer,
                                {
                                  opacity,
                                  transform: [{ translateX }, { scale }],
                                }
                              ]}
                            >
                              <View style={[
                                styles.swipeReplyIcon,
                                { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }
                              ]}>
                                <Animated.View style={{ transform: [{ rotate }] }}>
                                  <Ionicons name="arrow-undo" size={22} color={premiumColors.primary.main} />
                                </Animated.View>
                              </View>
                            </Animated.View>
                          );
                        }}
                        renderRightActions={(progress, dragX) => {

                          if (!isOwnMessage && !isModerator()) return null;

                          const translateX = dragX.interpolate({
                            inputRange: [-100, -80, -60, 0],
                            outputRange: [0, 8, 20, 80],
                            extrapolate: 'clamp',
                          });
                          const scale = dragX.interpolate({
                            inputRange: [-80, -40, 0],
                            outputRange: [1, 0.8, 0.3],
                            extrapolate: 'clamp',
                          });
                          const opacity = dragX.interpolate({
                            inputRange: [-60, -30, 0],
                            outputRange: [1, 0.5, 0],
                            extrapolate: 'clamp',
                          });
                          return (
                            <TouchableOpacity
                              onPress={() => handleSwipeDelete(discussion, isOwnMessage)}
                              activeOpacity={0.8}
                            >
                              <Animated.View
                                style={[
                                  styles.swipeDeleteContainer,
                                  {
                                    opacity,
                                    transform: [{ translateX }, { scale }],
                                  }
                                ]}
                              >
                                <View style={styles.swipeDeleteIcon}>
                                  <Ionicons name="trash" size={22} color="#FFFFFF" />
                                </View>
                              </Animated.View>
                            </TouchableOpacity>
                          );
                        }}
                        onSwipeableLeftOpen={() => setReplyingTo({ ...discussion, user: discussionUser })}
                        overshootLeft={false}
                        overshootRight={false}
                        friction={1.5}
                        leftThreshold={50}
                        rightThreshold={50}
                      >
                        <TapGestureHandler
                          numberOfTaps={2}
                          onHandlerStateChange={({ nativeEvent }) => {
                            if (nativeEvent.state === State.ACTIVE) {
                              handleDoubleTapLike(index, { emoji: '❤️', name: 'love' });
                            }
                          }}
                        >
                          <View style={styles.messageWrapper}>

                            {doubleTapHeartIndex === index && (
                              <Animated.View
                                style={[
                                  styles.doubleTapHeart,
                                  {
                                    opacity: doubleTapHeartAnim,
                                    transform: [
                                      { scale: doubleTapHeartAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0, 1.3, 1],
                                      })},
                                    ],
                                  },
                                ]}
                              >
                                <Text style={styles.doubleTapHeartEmoji}>❤️</Text>
                              </Animated.View>
                            )}
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onLongPress={() => openMessageActions({ ...discussion, content: discussion.message }, index, isOwnMessage)}
                              style={[
                                styles.messageContainer,
                                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
                              ]}
                            >

                              {!isOwnMessage && (
                                discussionUser?.avatar ? (
                                  <Image
                                    source={{ uri: discussionUser.avatar }}
                                    style={styles.messageAvatar}
                                  />
                                ) : (
                                  <View style={[styles.messageAvatarPlaceholder, { backgroundColor: '#2A3942' }]}>
                                    <Ionicons name="person" size={16} color="#8696A0" />
                                  </View>
                                )
                              )}

                              <View style={[
                                styles.messageBubble,
                                isOwnMessage ?
                                  [styles.ownMessageBubble, { backgroundColor: '#0B84FE' }] :
                                  [styles.otherMessageBubble, { backgroundColor: '#202C33' }],
                                messageData.type === MESSAGE_TYPES.IMAGE && styles.imageBubble,
                                messageData.type === MESSAGE_TYPES.IMAGE && (isOwnMessage ? styles.ownImageBubble : styles.otherImageBubble),
                              ]}>

                              {messageData.type !== MESSAGE_TYPES.IMAGE && (
                                <View style={[
                                  isOwnMessage ? styles.ownBubbleTail : styles.otherBubbleTail,
                                  { backgroundColor: isOwnMessage ? '#0B84FE' : '#202C33' }
                                ]}>
                                  <View style={[
                                    styles.bubbleTailCover,
                                    { backgroundColor: '#0B141A' },
                                    isOwnMessage ? styles.ownTailCover : styles.otherTailCover
                                  ]} />
                                </View>
                              )}

                              {!isOwnMessage && messageData.type !== MESSAGE_TYPES.IMAGE && (
                                <Text style={[styles.messageAuthor, { color: '#53BDEB' }]}>
                                  {discussionUser?.name?.toUpperCase() || 'MEMBER'}
                                </Text>
                              )}

                              {messageData.replyTo && (
                                <View style={[styles.replyPreview, {
                                  backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.15)' : colors.background,
                                  borderLeftColor: premiumColors.accent.emerald,
                                }]}>
                                  <Text style={[styles.replyAuthor, { color: isOwnMessage ? '#FFFFFF' : premiumColors.accent.emerald }]}>
                                    {messageData.replyTo.userName}
                                  </Text>
                                  <Text style={[styles.replyText, { color: isOwnMessage ? 'rgba(255,255,255,0.8)' : colors.secondaryText }]} numberOfLines={1}>
                                    {messageData.replyTo.message}
                                  </Text>
                                </View>
                              )}

                              {messageData.type === MESSAGE_TYPES.IMAGE && messageData.attachment?.uri && (
                                <TouchableOpacity
                                  onPress={() => openImagePreview(messageData.attachment.uri)}
                                  style={[
                                    styles.imageAttachment,
                                    isOwnMessage ? styles.ownImageBubble : styles.otherImageBubble
                                  ]}
                                  activeOpacity={0.95}
                                >
                                  <Image
                                    source={{ uri: messageData.attachment.uri }}
                                    style={[
                                      styles.attachedImage,
                                      isOwnMessage ? styles.ownImageBubble : styles.otherImageBubble
                                    ]}
                                    resizeMode="cover"
                                  />
                                  <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.35)']}
                                    style={[
                                      styles.imageGradientOverlay,
                                      isOwnMessage ? { borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 }
                                    ]}
                                  >
                                    <View style={styles.imageTimeContainer}>
                                      <Text style={styles.imageTimeText}>{formatTimeAgo(discussion.createdAt)}</Text>
                                      {isOwnMessage && (
                                        <Ionicons
                                          name="checkmark-done"
                                          size={13}
                                          color="#FFFFFF"
                                          style={{ marginLeft: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 2 }}
                                        />
                                      )}
                                    </View>
                                  </LinearGradient>
                                </TouchableOpacity>
                              )}

                              {messageData.type === MESSAGE_TYPES.DOCUMENT && messageData.attachment && (
                                <View
                                  style={[styles.documentAttachment, {
                                    backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.15)' : colors.background
                                  }]}
                                >
                                  <View style={[styles.documentIcon, { backgroundColor: getFileIcon(messageData.attachment.name).color + '20' }]}>
                                    <Ionicons
                                      name={getFileIcon(messageData.attachment.name).icon}
                                      size={24}
                                      color={getFileIcon(messageData.attachment.name).color}
                                    />
                                  </View>
                                  <View style={styles.documentInfo}>
                                    <Text style={[styles.documentName, { color: isOwnMessage ? '#FFFFFF' : colors.text }]} numberOfLines={1}>
                                      {messageData.attachment.name}
                                    </Text>
                                    <Text style={[styles.documentSize, { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.secondaryText }]}>
                                      {messageData.attachment.size ? `${(messageData.attachment.size / 1024).toFixed(1)} KB` : 'Document'}
                                    </Text>
                                  </View>
                                  <View style={styles.documentActions}>
                                    <TouchableOpacity
                                      style={[styles.documentActionBtn, { backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : colors.border }]}
                                      onPress={() => downloadDocument(messageData.attachment.uri, messageData.attachment.name)}
                                    >
                                      <Ionicons name="download-outline" size={18} color={isOwnMessage ? '#FFFFFF' : colors.text} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={[styles.documentActionBtn, { backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : colors.border }]}
                                      onPress={() => shareDocument(messageData.attachment.uri, messageData.attachment.name)}
                                    >
                                      <Ionicons name="share-outline" size={18} color={isOwnMessage ? '#FFFFFF' : colors.text} />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              )}

                              {messageData.type === MESSAGE_TYPES.VOICE && messageData.attachment && (
                                <TouchableOpacity
                                  style={[styles.voiceMessage, {
                                    backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.15)' : colors.background
                                  }]}
                                  onPress={() => playVoiceMessage(messageData.attachment.uri, discussion._id)}
                                  activeOpacity={0.8}
                                >
                                  <View style={[
                                    styles.voicePlayButton,
                                    { backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.25)' : premiumColors.primary.main + '20' }
                                  ]}>
                                    <Ionicons
                                      name={playingVoice === discussion._id ? "pause" : "play"}
                                      size={20}
                                      color={isOwnMessage ? '#FFFFFF' : premiumColors.primary.main}
                                    />
                                  </View>
                                  <View style={styles.voiceWaveform}>
                                    {[...Array(20)].map((_, i) => (
                                      <Animated.View
                                        key={i}
                                        style={[
                                          styles.voiceBar,
                                          {
                                            height: Math.random() * 16 + 6,
                                            backgroundColor: isOwnMessage ?
                                              (i / 20 <= (voiceProgress[discussion._id] || 0) ? '#FFFFFF' : 'rgba(255,255,255,0.4)') :
                                              (i / 20 <= (voiceProgress[discussion._id] || 0) ? premiumColors.primary.main : colors.border),
                                          }
                                        ]}
                                      />
                                    ))}
                                  </View>
                                  <Text style={[styles.voiceDuration, { color: isOwnMessage ? 'rgba(255,255,255,0.8)' : colors.secondaryText }]}>
                                    {formatDuration(messageData.attachment.duration || 0)}
                                  </Text>
                                </TouchableOpacity>
                              )}

                              {messageData.type === MESSAGE_TYPES.LINK && messageData.links && (
                                <TouchableOpacity
                                  style={[styles.linkPreview, {
                                    backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.15)' : colors.background
                                  }]}
                                  onPress={() => Linking.openURL(messageData.links[0])}
                                >
                                  <View style={[styles.linkIcon, { backgroundColor: premiumColors.accent.sky + '20' }]}>
                                    <Ionicons name="link" size={20} color={premiumColors.accent.sky} />
                                  </View>
                                  <View style={styles.linkInfo}>
                                    <Text style={[styles.linkUrl, { color: isOwnMessage ? '#FFFFFF' : premiumColors.accent.sky }]} numberOfLines={1}>
                                      {messageData.links[0]}
                                    </Text>
                                    <Text style={[styles.linkHint, { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.secondaryText }]}>
                                      Tap to open
                                    </Text>
                                  </View>
                                  <Ionicons name="open-outline" size={18} color={isOwnMessage ? '#FFFFFF' : colors.secondaryText} />
                                </TouchableOpacity>
                              )}

                              {messageData.message && messageData.type !== MESSAGE_TYPES.VOICE && (
                                <Text style={[
                                  styles.messageText,
                                  { color: isOwnMessage ? '#FFFFFF' : '#E9EDEF' }
                                ]}>
                                  {messageData.message}
                                </Text>
                              )}

                              {(messageData.type !== MESSAGE_TYPES.IMAGE || messageData.message) && (
                                <View style={styles.messageFooter}>
                                  <Text style={[styles.messageTime, { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#8696A0' }]}>
                                    {formatTimeAgo(discussion.createdAt)}
                                  </Text>
                                  {isOwnMessage && (
                                    <Ionicons name="checkmark-done" size={14} color="#53BDEB" style={{ marginLeft: 4 }} />
                                  )}
                                </View>
                              )}
                            </View>

                          </TouchableOpacity>
                          </View>
                        </TapGestureHandler>
                      </Swipeable>

                      {reactions.length > 0 && (
                        <View style={[
                          styles.reactionsContainer,
                          isOwnMessage ? styles.ownReactions : styles.otherReactions,
                        ]}>
                          {reactions.map((reaction, rIndex) => (
                            <View
                              key={rIndex}
                              style={[
                                styles.reactionBubble,
                                {
                                  backgroundColor: isDarkMode ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                                  borderColor: isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.15)',
                                  shadowColor: isDarkMode ? '#6366F1' : '#000',
                                }
                              ]}
                            >
                              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {showReactionPicker === index && (
                        <Animated.View
                          style={[
                            styles.reactionPicker,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                              opacity: reactionPickerAnim,
                              transform: [{ scale: reactionPickerAnim }],
                            },
                            premiumShadows.lg,
                            isOwnMessage ? styles.ownReactionPicker : styles.otherReactionPicker,
                          ]}
                        >
                          {REACTIONS.map((reaction) => (
                            <TouchableOpacity
                              key={reaction.name}
                              style={styles.reactionOption}
                              onPress={() => handleReaction(index, reaction)}
                            >
                              <Text style={styles.reactionOptionEmoji}>{reaction.emoji}</Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity
                            style={styles.reactionCloseButton}
                            onPress={() => setShowReactionPicker(null)}
                          >
                            <Ionicons name="close" size={16} color={colors.secondaryText} />
                          </TouchableOpacity>
                        </Animated.View>
                      )}
                    </View>
                  );
                })
          ) : (
            <View style={styles.whatsappEmptyChat}>
              <View style={styles.whatsappEmptyIcon}>
                <Ionicons name="chatbubbles" size={60} color="#8696A0" />
              </View>
              <Text style={styles.whatsappEmptyTitle}>
                No messages yet
              </Text>
              <Text style={styles.whatsappEmptyText}>
                Say hello and start the conversation!
              </Text>
            </View>
          )}
        </ScrollView>

            {isMember() ? (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
              >

                {replyingTo && (
                  <View style={[styles.replyingToContainer, {
                    backgroundColor: isDarkMode ? 'rgba(30, 30, 40, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                    borderTopColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                  }]}>
                    <View style={[styles.replyingToBar, {
                      backgroundColor: '#10B981',
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                    }]} />
                    <View style={styles.replyingToContent}>
                      <Text style={[styles.replyingToLabel, { color: '#10B981' }]}>
                        Replying to {replyingTo.user?.name || 'Member'}
                      </Text>
                      <Text style={[styles.replyingToText, { color: colors.secondaryText }]} numberOfLines={1}>
                        {(() => {
                          try {
                            const parsed = JSON.parse(replyingTo.message);
                            return parsed.message || replyingTo.message;
                          } catch {
                            return replyingTo.message;
                          }
                        })()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={cancelReply}
                      style={[styles.cancelReplyButton, {
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'
                      }]}
                    >
                      <Ionicons name="close" size={18} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </View>
                )}

                {(selectedImage || selectedDocument) && (
                  <View style={[styles.attachmentPreview, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    {selectedImage && (
                      <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: selectedImage.uri }} style={styles.previewThumbnail} />
                        <View style={styles.previewInfo}>
                          <Text style={[styles.previewName, { color: colors.text }]}>Photo attached</Text>
                          <Text style={[styles.previewSize, { color: colors.secondaryText }]}>Ready to send</Text>
                        </View>
                      </View>
                    )}
                    {selectedDocument && (
                      <View style={styles.documentPreviewContainer}>
                        <View style={[styles.documentPreviewIcon, { backgroundColor: getFileIcon(selectedDocument.name).color + '20' }]}>
                          <Ionicons
                            name={getFileIcon(selectedDocument.name).icon}
                            size={24}
                            color={getFileIcon(selectedDocument.name).color}
                          />
                        </View>
                        <View style={styles.previewInfo}>
                          <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>
                            {selectedDocument.name}
                          </Text>
                          <Text style={[styles.previewSize, { color: colors.secondaryText }]}>
                            {selectedDocument.size ? `${(selectedDocument.size / 1024).toFixed(1)} KB` : 'Document'}
                          </Text>
                        </View>
                      </View>
                    )}
                    <TouchableOpacity onPress={cancelAttachment} style={styles.cancelAttachmentButton}>
                      <Ionicons name="close-circle" size={24} color={colors.error || '#FF3B30'} />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.whatsappInputContainer}>
                  {/* Plus/Add Button */}
                  <TouchableOpacity
                    style={styles.whatsappAddBtn}
                    onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  >
                    <Ionicons
                      name={showAttachmentMenu ? 'close' : 'add'}
                      size={28}
                      color="#8696A0"
                    />
                  </TouchableOpacity>

                  {/* Message Input with Emoji */}
                  <View style={styles.whatsappInputWrapper}>
                    <TextInput
                      style={styles.whatsappInput}
                      placeholder="Message..."
                      placeholderTextColor="#8696A0"
                      value={discussionMessage}
                      onChangeText={setDiscussionMessage}
                      multiline
                      maxLength={1000}
                    />
                    <TouchableOpacity
                      style={styles.whatsappEmojiBtn}
                      onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Ionicons
                        name={showEmojiPicker ? "happy" : "happy-outline"}
                        size={24}
                        color="#8696A0"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Mic/Send Button */}
                  {discussionMessage.trim() || selectedImage || selectedDocument ? (
                    <TouchableOpacity
                      style={styles.whatsappMicBtn}
                      onPress={handleSendMessage}
                      disabled={sendingMessage}
                    >
                      {sendingMessage ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="send" size={22} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.whatsappMicBtn, isRecording && { backgroundColor: '#FF3B30' }]}
                      onPress={isRecording ? sendVoiceMessage : startRecording}
                      onLongPress={startRecording}
                    >
                      <Animated.View style={{ transform: [{ scale: isRecording ? recordingAnimRef : 1 }] }}>
                        <Ionicons
                          name={isRecording ? "stop" : "mic"}
                          size={22}
                          color="#FFFFFF"
                        />
                      </Animated.View>
                    </TouchableOpacity>
                  )}
                </View>

                {isRecording && (
                  <View style={styles.recordingOverlay}>
                    <LinearGradient
                      colors={['rgba(255,59,48,0.95)', 'rgba(255,45,85,0.95)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.recordingOverlayGradient}
                    >

                      <TouchableOpacity
                        style={styles.recordingCancelBtn}
                        onPress={cancelRecording}
                      >
                        <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                      </TouchableOpacity>

                      <View style={styles.recordingCenter}>

                        <View style={styles.recordingWaveform}>
                          {[...Array(12)].map((_, i) => (
                            <Animated.View
                              key={i}
                              style={[
                                styles.recordingWaveBar,
                                {
                                  height: Math.sin((i + recordingDuration) * 0.5) * 12 + 8,
                                  opacity: 0.6 + Math.sin((i + recordingDuration * 2) * 0.3) * 0.4,
                                }
                              ]}
                            />
                          ))}
                        </View>

                        <View style={styles.recordingTimerContainer}>
                          <Animated.View style={[
                            styles.recordingPulseDot,
                            { transform: [{ scale: recordingAnimRef }] }
                          ]} />
                          <Text style={styles.recordingTimer}>
                            {formatDuration(recordingDuration)}
                          </Text>
                        </View>

                        <Text style={styles.recordingHint}>
                          Tap send to finish
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.recordingSendBtn}
                        onPress={sendVoiceMessage}
                      >
                        <View style={styles.recordingSendBtnInner}>
                          <Ionicons name="arrow-up" size={22} color="#FF3B30" />
                        </View>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                )}

                {showAttachmentMenu && (
                  <Animated.View
                    style={[
                      styles.attachmentMenu,
                      {
                        backgroundColor: colors.card,
                        borderTopColor: colors.border,
                        opacity: attachmentMenuAnim,
                        transform: [{
                          translateY: attachmentMenuAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        }],
                      },
                    ]}
                  >
                    <TouchableOpacity style={styles.attachmentOption} onPress={pickImage}>
                      <LinearGradient
                        colors={['#9C27B0', '#7B1FA2']}
                        style={styles.attachmentIconGradient}
                      >
                        <Ionicons name="images" size={24} color="#FFFFFF" />
                      </LinearGradient>
                      <Text style={[styles.attachmentLabel, { color: colors.text }]}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.attachmentOption} onPress={takePhoto}>
                      <LinearGradient
                        colors={['#E91E63', '#C2185B']}
                        style={styles.attachmentIconGradient}
                      >
                        <Ionicons name="camera" size={24} color="#FFFFFF" />
                      </LinearGradient>
                      <Text style={[styles.attachmentLabel, { color: colors.text }]}>Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.attachmentOption} onPress={pickDocument}>
                      <LinearGradient
                        colors={['#3F51B5', '#303F9F']}
                        style={styles.attachmentIconGradient}
                      >
                        <Ionicons name="document" size={24} color="#FFFFFF" />
                      </LinearGradient>
                      <Text style={[styles.attachmentLabel, { color: colors.text }]}>Document</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.attachmentOption}>
                      <LinearGradient
                        colors={['#00BCD4', '#0097A7']}
                        style={styles.attachmentIconGradient}
                      >
                        <Ionicons name="link" size={24} color="#FFFFFF" />
                      </LinearGradient>
                      <Text style={[styles.attachmentLabel, { color: colors.text }]}>Link</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.attachmentOption} onPress={() => { setShowAttachmentMenu(false); startRecording(); }}>
                      <LinearGradient
                        colors={['#FF5722', '#E64A19']}
                        style={styles.attachmentIconGradient}
                      >
                        <Ionicons name="mic" size={24} color="#FFFFFF" />
                      </LinearGradient>
                      <Text style={[styles.attachmentLabel, { color: colors.text }]}>Voice</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.attachmentOption}>
                      <LinearGradient
                        colors={['#4CAF50', '#388E3C']}
                        style={styles.attachmentIconGradient}
                      >
                        <Ionicons name="location" size={24} color="#FFFFFF" />
                      </LinearGradient>
                      <Text style={[styles.attachmentLabel, { color: colors.text }]}>Location</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {showEmojiPicker && (
                  <EmojiPicker
                    colors={colors}
                    onSelectEmoji={insertEmoji}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </KeyboardAvoidingView>
            ) : (
              <View style={styles.whatsappJoinPrompt}>
                <Text style={styles.whatsappJoinText}>
                  Join this group to participate in the discussion
                </Text>
                <TouchableOpacity
                  style={styles.whatsappJoinBtn}
                  onPress={handleJoin}
                >
                  <Text style={styles.whatsappJoinBtnText}>Join Group</Text>
                </TouchableOpacity>
              </View>
            )}

      <Modal
        visible={showJoinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Join Private Group</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalText, { color: colors.secondaryText }]}>
              This is a private group. Please enter the invite code to join.
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter invite code"
              placeholderTextColor={colors.secondaryText}
              value={joinInviteCode}
              onChangeText={setJoinInviteCode}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleJoinWithCode}
            >
              <Text style={styles.modalButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showResourceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Resource</Text>
              <TouchableOpacity onPress={() => setShowResourceModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Resource Title"
              placeholderTextColor={colors.secondaryText}
              value={newResource.title}
              onChangeText={(text) => setNewResource({ ...newResource, title: text })}
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="URL"
              placeholderTextColor={colors.secondaryText}
              value={newResource.url}
              onChangeText={(text) => setNewResource({ ...newResource, url: text })}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleAddResource}
            >
              <Text style={styles.modalButtonText}>Add Resource</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isInCall}
        transparent={false}
        animationType="slide"
        onRequestClose={endCall}
        statusBarTranslucent
      >
        <View style={styles.callModal}>
          {callType === 'video' ? (
            <View style={styles.faceTimeContainer}>
              <View style={styles.faceTimeMain}>
                {isVideoOn ? (
                  <View style={styles.faceTimeGroupView}>
                    <LinearGradient colors={['#1c1c1e', '#2c2c2e', '#1c1c1e']} style={styles.faceTimeGroupGradient}>
                      <View style={styles.faceTimeGroupAvatars}>
                        {group?.members?.slice(0, 4).map((member, index) => {
                          const memberUser = typeof member.user === 'object' ? member.user : null;
                          return (
                            <View key={index} style={styles.faceTimeParticipant}>
                              {memberUser?.avatar ? (
                                <Image source={{ uri: memberUser.avatar }} style={styles.faceTimeParticipantAvatar} />
                              ) : (
                                <View style={styles.faceTimeParticipantPlaceholder}>
                                  <Ionicons name="person" size={40} color="rgba(255,255,255,0.6)" />
                                </View>
                              )}
                              <Text style={styles.faceTimeParticipantName} numberOfLines={1}>
                                {memberUser?.name || 'Member'}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                      {memberCount > 4 && (
                        <Text style={styles.faceTimeMoreParticipants}>+{memberCount - 4} more</Text>
                      )}
                    </LinearGradient>
                  </View>
                ) : (
                  <View style={styles.faceTimeVideoOff}>
                    <View style={styles.faceTimeVideoOffIcon}>
                      <Ionicons name="videocam-off" size={50} color="#FFFFFF" />
                    </View>
                    <Text style={styles.faceTimeVideoOffText}>Camera Off</Text>
                  </View>
                )}
              </View>

              <View style={styles.faceTimeSelfContainer}>
                {isVideoOn && cameraPermission?.granted ? (
                  <CameraView style={styles.faceTimeSelfCamera} facing={isFrontCamera ? 'front' : 'back'} />
                ) : (
                  <View style={styles.faceTimeSelfPlaceholder}>
                    <Ionicons name="person" size={30} color="rgba(255,255,255,0.5)" />
                  </View>
                )}
              </View>

              <View style={styles.faceTimeTopBar}>
                <View style={styles.faceTimeInfo}>
                  <Text style={styles.faceTimeGroupName}>{group?.name}</Text>
                  <View style={styles.faceTimeStatusRow}>
                    <View style={styles.faceTimeLiveIndicator} />
                    <Text style={styles.faceTimeDuration}>
                      {callDuration > 0 ? formatCallDuration(callDuration) : 'Connecting...'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.faceTimeControls}>
                <View style={styles.faceTimeControlsRow}>
                  <TouchableOpacity style={[styles.faceTimeControlBtn, isMuted && styles.faceTimeControlBtnActive]} onPress={toggleMute}>
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.faceTimeEndCall} onPress={endCall}>
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.faceTimeControlBtn, !isVideoOn && styles.faceTimeControlBtnActive]} onPress={toggleVideo}>
                    <Ionicons name={isVideoOn ? "videocam" : "videocam-off"} size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.faceTimeSecondaryRow}>
                  <TouchableOpacity style={styles.faceTimeSecondaryBtn} onPress={toggleCamera}>
                    <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
                    <Text style={styles.faceTimeSecondaryLabel}>Flip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.faceTimeSecondaryBtn, isSpeakerOn && styles.faceTimeSecondaryBtnActive]} onPress={toggleSpeaker}>
                    <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium-outline"} size={22} color="#FFFFFF" />
                    <Text style={styles.faceTimeSecondaryLabel}>Speaker</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.faceTimeSecondaryBtn}>
                    <Ionicons name="apps-outline" size={22} color="#FFFFFF" />
                    <Text style={styles.faceTimeSecondaryLabel}>Effects</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <LinearGradient colors={['#667eea', '#764ba2', '#6B8DD6']} style={styles.callBackground}>
              <View style={styles.voiceCallContainer}>
                <Animated.View style={[styles.callAvatarContainer, { transform: [{ scale: callPulseAnim }] }]}>
                  <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.callAvatarRing}>
                    <View style={styles.callAvatar}>
                      <Ionicons name="people" size={50} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.callGroupName}>{group?.name}</Text>
                <Text style={styles.callStatus}>{callDuration > 0 ? formatCallDuration(callDuration) : 'Connecting...'}</Text>
                <View style={styles.callParticipants}>
                  <Text style={styles.callParticipantsText}>{memberCount} participants</Text>
                </View>
              </View>
              <View style={styles.callControls}>
                <View style={styles.callControlsRow}>
                  <TouchableOpacity style={[styles.callControlBtn, isMuted && styles.callControlBtnActive]} onPress={toggleMute}>
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={26} color="#FFFFFF" />
                    <Text style={styles.callControlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.callControlBtn, isSpeakerOn && styles.callControlBtnActive]} onPress={toggleSpeaker}>
                    <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={26} color="#FFFFFF" />
                    <Text style={styles.callControlLabel}>{isSpeakerOn ? 'Speaker' : 'Phone'}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
                  <LinearGradient colors={['#FF3B30', '#FF453A']} style={styles.endCallBtnGradient}>
                    <Ionicons name="call" size={30} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}
        </View>
      </Modal>

      <Modal
        visible={showImagePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}
      >
        <View style={styles.imagePreviewModal}>
          <TouchableOpacity
            style={styles.imagePreviewClose}
            onPress={() => setShowImagePreview(false)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.imagePreviewActions}>
            <TouchableOpacity
              style={styles.imagePreviewAction}
              onPress={() => shareImage(previewImage)}
            >
              <View style={styles.imagePreviewActionIcon}>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.imagePreviewActionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imagePreviewAction}
              onPress={() => downloadImage(previewImage)}
            >
              <View style={styles.imagePreviewActionIcon}>
                <Ionicons name="download-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.imagePreviewActionText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imagePreviewAction}
              onPress={() => setShowImagePreview(false)}
            >
              <View style={styles.imagePreviewActionIcon}>
                <Ionicons name="close-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.imagePreviewActionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMessageActions}
        transparent={true}
        animationType="none"
        onRequestClose={closeMessageActions}
      >
        <TouchableOpacity
          style={styles.messageActionsOverlay}
          activeOpacity={1}
          onPress={closeMessageActions}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Animated.View
              style={[
                styles.messageActionsContainer,
                {
                  opacity: messageActionsAnim,
                  transform: [{
                    translateY: messageActionsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  }],
                },
              ]}
            >

              <View style={[styles.messageActionsReactions, { backgroundColor: isDarkMode ? '#1c1c1e' : '#FFFFFF' }]}>
                {['❤️', '👍', '👎', '😂', '😮', '😢', '🔥', '🎉'].map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.messageActionsReactionBtn}
                    onPress={() => {
                      if (selectedMessage) {
                        handleReaction(selectedMessage.index, { emoji, name: emoji });
                      }
                      closeMessageActions();
                    }}
                  >
                    <Text style={styles.messageActionsReactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.messageActionsMenu, { backgroundColor: isDarkMode ? '#1c1c1e' : '#FFFFFF' }]}>
                <TouchableOpacity style={styles.messageActionItem} onPress={handleReplyToMessage}>
                  <View style={[styles.messageActionIcon, { backgroundColor: '#007AFF15' }]}>
                    <Ionicons name="arrow-undo" size={20} color="#007AFF" />
                  </View>
                  <Text style={[styles.messageActionText, { color: colors.text }]}>Reply</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                </TouchableOpacity>

                <View style={[styles.messageActionDivider, { backgroundColor: colors.border }]} />

                <TouchableOpacity style={styles.messageActionItem} onPress={handleCopyMessage}>
                  <View style={[styles.messageActionIcon, { backgroundColor: '#34C75915' }]}>
                    <Ionicons name="copy" size={20} color="#34C759" />
                  </View>
                  <Text style={[styles.messageActionText, { color: colors.text }]}>Copy</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                </TouchableOpacity>

                <View style={[styles.messageActionDivider, { backgroundColor: colors.border }]} />

                <TouchableOpacity style={styles.messageActionItem} onPress={handleForwardMessage}>
                  <View style={[styles.messageActionIcon, { backgroundColor: '#5856D615' }]}>
                    <Ionicons name="arrow-redo" size={20} color="#5856D6" />
                  </View>
                  <Text style={[styles.messageActionText, { color: colors.text }]}>Forward</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                </TouchableOpacity>

                {(selectedMessage?.isOwnMessage || isModerator()) && (
                  <>
                    <View style={[styles.messageActionDivider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity style={styles.messageActionItem} onPress={handleDeleteMessage}>
                      <View style={[styles.messageActionIcon, { backgroundColor: '#FF3B3015' }]}>
                        <Ionicons name="trash" size={20} color="#FF3B30" />
                      </View>
                      <Text style={[styles.messageActionText, { color: '#FF3B30' }]}>Delete</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </>
                )}

                {!selectedMessage?.isOwnMessage && (
                  <>
                    <View style={[styles.messageActionDivider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity style={styles.messageActionItem} onPress={handleReportMessage}>
                      <View style={[styles.messageActionIcon, { backgroundColor: '#FF950015' }]}>
                        <Ionicons name="flag" size={20} color="#FF9500" />
                      </View>
                      <Text style={[styles.messageActionText, { color: '#FF9500' }]}>Report</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[styles.messageActionsCancelBtn, { backgroundColor: isDarkMode ? '#1c1c1e' : '#FFFFFF' }]}
                onPress={closeMessageActions}
              >
                <Text style={styles.messageActionsCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {renderVoiceCallModal()}
      {renderGroupOptionsModal()}
      {renderEditGroupModal()}
      {renderGroupInfoModal()}
    </View>
    </GestureHandlerRootView>
  );
}

function InfoSection({ title, value, colors }) {
  return (
    <View style={styles.infoSection}>
      <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>{title}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function EmojiPicker({ colors, onSelectEmoji, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [recentEmojis, setRecentEmojis] = useState(['😀', '😂', '❤️', '👍', '🔥', '🎉', '😊', '🙏']);

  const handleEmojiSelect = (emoji) => {
    onSelectEmoji(emoji);

    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      return [emoji, ...filtered].slice(0, 8);
    });
  };

  return (
    <View style={[styles.emojiPickerContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>

      <View style={styles.emojiPickerHeader}>
        <Text style={[styles.emojiPickerTitle, { color: colors.text }]}>Emojis</Text>
        <TouchableOpacity onPress={onClose} style={styles.emojiPickerClose}>
          <Ionicons name="chevron-down" size={24} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      <View style={styles.recentEmojisSection}>
        <Text style={[styles.emojiCategoryLabel, { color: colors.secondaryText }]}>Recently Used</Text>
        <View style={styles.emojiGrid}>
          {recentEmojis.map((emoji, index) => (
            <TouchableOpacity
              key={`recent-${index}`}
              style={styles.emojiItem}
              onPress={() => handleEmojiSelect(emoji)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.emojiCategoryTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.emojiCategoryTabsContent}
        >
          {EMOJI_CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.emojiCategoryTab,
                selectedCategory === index && { backgroundColor: premiumColors.primary.main + '20' },
              ]}
              onPress={() => setSelectedCategory(index)}
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={selectedCategory === index ? premiumColors.primary.main : colors.secondaryText}
              />
              <Text style={[
                styles.emojiCategoryTabText,
                { color: selectedCategory === index ? premiumColors.primary.main : colors.secondaryText }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.emojiScrollView}
        contentContainerStyle={styles.emojiScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.emojiCategoryLabel, { color: colors.secondaryText }]}>
          {EMOJI_CATEGORIES[selectedCategory].name}
        </Text>
        <View style={styles.emojiGrid}>
          {EMOJI_CATEGORIES[selectedCategory].emojis.map((emoji, index) => (
            <TouchableOpacity
              key={`${selectedCategory}-${index}`}
              style={styles.emojiItem}
              onPress={() => handleEmojiSelect(emoji)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  groupDescription: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  groupMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
  },
  actionsContainer: {
    padding: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.sm,
    ...premiumShadows.md,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 2,
    marginRight: spacing.lg,
  },
  tabText: {
    fontSize: fontSize.md,
  },
  tabContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: fontSize.md,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  goalText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  scheduleText: {
    fontSize: fontSize.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
  },
  tagText: {
    fontSize: fontSize.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  creatorBadge: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: fontSize.xs,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discussionCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  discussionContent: {
    flex: 1,
  },
  discussionAuthor: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  discussionMessage: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  discussionTime: {
    fontSize: fontSize.xs,
  },
  addResourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...premiumShadows.md,
  },
  addResourceText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  resourceMeta: {
    fontSize: fontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    ...premiumShadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  modalButton: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.base,
    alignItems: 'center',
    ...premiumShadows.md,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  modalText: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },

  discussionsContainer: {
    flex: 1,
  },
  messagesScrollView: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageWrapper: {
    marginBottom: spacing.sm,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    display: 'none',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 1,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
    paddingLeft: 60,
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
    paddingRight: 60,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },
  messageAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    position: 'relative',
  },
  imageBubble: {
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  ownMessageBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
  },

  ownBubbleTail: {
    position: 'absolute',
    bottom: 0,
    right: -6,
    width: 12,
    height: 16,
  },

  otherBubbleTail: {
    position: 'absolute',
    bottom: 0,
    left: -6,
    width: 12,
    height: 16,
  },
  bubbleTailCover: {
    width: 12,
    height: 16,
    position: 'absolute',
  },
  ownTailCover: {
    borderBottomLeftRadius: 10,
    right: 0,
    bottom: 0,
  },
  otherTailCover: {
    borderBottomRightRadius: 10,
    left: 0,
    bottom: 0,
  },
  messageAuthor: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.3,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '400',
  },
  messageActions: {
    display: 'none',
  },

  replyPreview: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderLeftWidth: 3,
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
  },

  imageAttachment: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    minWidth: width * 0.5,
    maxWidth: width * 0.65,
  },
  attachedImage: {
    width: width * 0.55,
    height: width * 0.65,
    borderRadius: 18,
  },

  imageMessageWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  ownImageBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  otherImageBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 18,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingBottom: 8,
  },
  imageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageTimeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: premiumBorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  documentSize: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  documentActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    minWidth: width * 0.55,
    gap: 10,
  },
  voicePlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 2,
  },
  voiceBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'right',
  },

  recordingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  recordingOverlayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 80,
  },
  recordingCancelBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  recordingWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    gap: 3,
    marginBottom: 8,
  },
  recordingWaveBar: {
    width: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  recordingTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingPulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  recordingTimer: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  recordingHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  recordingSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingSendBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  linkPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkInfo: {
    flex: 1,
  },
  linkUrl: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  linkHint: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },

  reactionsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: -6,
    paddingHorizontal: 50,
    flexWrap: 'wrap',
  },
  ownReactions: {
    justifyContent: 'flex-end',
  },
  otherReactions: {
    justifyContent: 'flex-start',
  },
  reactionBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },

  reactionPicker: {
    position: 'absolute',
    top: -50,
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    zIndex: 100,
    gap: 4,
  },
  ownReactionPicker: {
    right: 40,
  },
  otherReactionPicker: {
    left: 40,
  },
  reactionOption: {
    padding: 4,
  },
  reactionOptionEmoji: {
    fontSize: 20,
  },
  reactionCloseButton: {
    padding: 4,
    marginLeft: 4,
  },

  emptyDiscussions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyDiscussionsIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyDiscussionsTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyDiscussionsText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },

  advancedInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: premiumBorderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 44,
    maxHeight: 120,
  },
  advancedInput: {
    flex: 1,
    fontSize: fontSize.md,
    maxHeight: 100,
    paddingVertical: spacing.xs,
  },
  emojiButton: {
    padding: spacing.xs,
  },
  sendMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...premiumShadows.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },

  attachmentMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.lg,
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
    width: (width - spacing.lg * 4) / 3 - spacing.lg,
    marginBottom: spacing.md,
  },
  attachmentIconGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...premiumShadows.sm,
  },
  attachmentLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },

  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  replyingToBar: {
    width: 3,
    height: 36,
    borderRadius: 1.5,
    marginRight: spacing.md,
  },
  replyingToContent: {
    flex: 1,
    justifyContent: 'center',
  },
  replyingToLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  replyingToText: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.3,
  },
  cancelReplyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  previewThumbnail: {
    width: 48,
    height: 48,
    borderRadius: premiumBorderRadius.base,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  previewSize: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  documentPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  documentPreviewIcon: {
    width: 48,
    height: 48,
    borderRadius: premiumBorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelAttachmentButton: {
    padding: spacing.xs,
  },

  callModal: {
    flex: 1,
  },
  callBackground: {
    flex: 1,
    paddingTop: 60,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    marginTop: 12,
  },
  videoOff: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 12,
  },
  selfVideoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selfVideo: {
    width: 100,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceCallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  callAvatarContainer: {
    marginBottom: 24,
  },
  callAvatarRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  callAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callGroupName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  callParticipants: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callParticipantsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  videoCallInfo: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  videoCallName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoCallDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  callControls: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  callControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20,
  },
  callControlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  callControlBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  callControlLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  endCallBtn: {
    alignSelf: 'center',
  },
  endCallBtnGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  faceTimeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  faceTimeMain: {
    flex: 1,
  },
  faceTimeGroupView: {
    flex: 1,
  },
  faceTimeGroupGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceTimeGroupAvatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  faceTimeParticipant: {
    alignItems: 'center',
    width: (width - 120) / 2,
  },
  faceTimeParticipantAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  faceTimeParticipantPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  faceTimeParticipantName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  faceTimeMoreParticipants: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 20,
  },
  faceTimeVideoOff: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceTimeVideoOffIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  faceTimeVideoOffText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  faceTimeSelfContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#2c2c2e',
  },
  faceTimeSelfCamera: {
    flex: 1,
  },
  faceTimeSelfPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
  },
  faceTimeTopBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 150,
  },
  faceTimeInfo: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  faceTimeGroupName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  faceTimeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faceTimeLiveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#30D158',
    marginRight: 8,
  },
  faceTimeDuration: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  faceTimeControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  faceTimeControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginBottom: 24,
  },
  faceTimeControlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceTimeControlBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  faceTimeEndCall: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceTimeSecondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 50,
  },
  faceTimeSecondaryBtn: {
    alignItems: 'center',
    opacity: 0.9,
  },
  faceTimeSecondaryBtnActive: {
    opacity: 1,
  },
  faceTimeSecondaryLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
  },

  imagePreviewModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height * 0.7,
  },
  imagePreviewActions: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    gap: spacing.xl * 2,
  },
  imagePreviewAction: {
    alignItems: 'center',
  },
  imagePreviewActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePreviewActionText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '500',
  },

  chatHeader: {
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingBottom: spacing.md + 4,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  chatHeaderOrb1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chatHeaderOrb2: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chatHeaderOrb3: {
    position: 'absolute',
    top: 60,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBackButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatarContainer: {
    position: 'relative',
  },
  chatAvatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chatHeaderGroupIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chatHeaderGroupImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  chatOnlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatOnlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  chatHeaderText: {
    flex: 1,
    marginLeft: spacing.sm + 4,
  },
  chatHeaderTitle: {
    fontSize: fontSize.lg + 1,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  chatHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  chatMemberAvatars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  chatMemberAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  chatMemberAvatarPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  chatMemberInitial: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatMemberAvatarMore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  chatMemberMoreText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatHeaderSubtitle: {
    fontSize: fontSize.xs + 1,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chatHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenChat: {
    flex: 1,
  },
  chatMessagesScrollView: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageReplyAction: {
    padding: 4,
    opacity: 0,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  chatAttachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 44,
    maxHeight: 120,
  },
  chatInput: {
    flex: 1,
    fontSize: fontSize.md,
    maxHeight: 100,
    paddingVertical: spacing.xs,
  },
  chatEmojiButton: {
    padding: spacing.xs,
  },
  chatSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...premiumShadows.sm,
  },
  chatAttachmentMenu: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    justifyContent: 'space-around',
  },
  chatAttachmentOption: {
    alignItems: 'center',
  },
  chatAttachmentIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...premiumShadows.sm,
  },
  chatAttachmentLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },

  emojiPickerContainer: {
    height: 340,
    borderTopWidth: 1,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emojiPickerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  emojiPickerClose: {
    padding: spacing.xs,
  },
  recentEmojisSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  emojiCategoryLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emojiCategoryTabsWrapper: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  emojiCategoryTabsContent: {
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    height: 50,
  },
  emojiCategoryTab: {
    paddingHorizontal: spacing.md,
    height: 42,
    borderRadius: premiumBorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: spacing.xs,
    gap: 6,
  },
  emojiCategoryTabText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  emojiScrollView: {
    flex: 1,
  },
  emojiScrollContent: {
    padding: spacing.md,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiItem: {
    width: (width - spacing.md * 2) / 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },

  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xl,
  },
  actionSheetHeader: {
    borderRadius: premiumBorderRadius.xl,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  actionSheetGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  actionSheetGroupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionSheetGroupAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  actionSheetGroupDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  actionSheetGroupName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSheetGroupMeta: {
    fontSize: fontSize.sm,
  },
  actionSheetSection: {
    borderRadius: premiumBorderRadius.xl,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  actionSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  actionSheetIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionSheetItemText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  actionSheetItemValue: {
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
  },
  actionSheetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: spacing.sm,
  },
  actionSheetBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  actionSheetCancelBtn: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  actionSheetCancelText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },

  editGroupModal: {
    flex: 1,
  },
  editGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editGroupCancelBtn: {
    fontSize: fontSize.md,
    fontWeight: '400',
  },
  editGroupTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  editGroupSaveBtn: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  editGroupContent: {
    flex: 1,
  },
  editGroupPhotoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  editGroupPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  editGroupPhotoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  editGroupPhotoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editGroupPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editGroupPhotoBtn: {
    marginTop: spacing.md,
  },
  editGroupPhotoBtnText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  editGroupSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
  },
  editGroupSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editGroupField: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editGroupFieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  editGroupFieldInput: {
    fontSize: fontSize.md,
    fontWeight: '400',
    padding: 0,
  },
  editGroupFieldMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editGroupOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  editGroupOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.md,
    borderWidth: 1,
  },
  editGroupOptionText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  editGroupSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  editGroupSliderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editGroupSliderValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'center',
  },
  editGroupToggleField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  editGroupToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editGroupToggleText: {
    marginLeft: spacing.md,
  },
  editGroupToggleLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  editGroupToggleDesc: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  editGroupToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  editGroupToggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  editGroupDangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  editGroupDangerBtnText: {
    color: '#FF3B30',
    fontSize: fontSize.md,
    fontWeight: '500',
  },

  groupInfoOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  groupInfoBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  groupInfoContainer: {
    maxHeight: height * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.sm,
  },
  groupInfoHandle: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  groupInfoHandleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  groupInfoHeader: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  groupInfoAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupInfoAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  groupInfoName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  groupInfoDesc: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  groupInfoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  groupInfoStat: {
    flex: 1,
    alignItems: 'center',
  },
  groupInfoStatValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  groupInfoStatLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  groupInfoStatDivider: {
    width: 1,
    height: 30,
  },
  groupInfoScroll: {
    flex: 1,
  },
  groupInfoSection: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
  },
  groupInfoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  groupInfoSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  groupInfoSeeAll: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  groupInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  groupInfoRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  groupInfoRowContent: {
    flex: 1,
  },
  groupInfoRowLabel: {
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  groupInfoRowValue: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  groupInfoMembersList: {
    gap: spacing.sm,
  },
  groupInfoMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  groupInfoMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  groupInfoMemberAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  groupInfoMemberInfo: {
    flex: 1,
  },
  groupInfoMemberName: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  groupInfoMemberRole: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  groupInfoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  groupInfoActionBtn: {
    width: (width - spacing.md * 4 - spacing.sm * 3) / 4,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.md,
  },
  groupInfoActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  groupInfoActionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  groupInfoButtonSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  groupInfoJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.sm,
  },
  groupInfoJoinBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  groupInfoLeaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  groupInfoLeaveBtnText: {
    color: '#FF3B30',
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  messageActionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 34,
    paddingHorizontal: spacing.sm,
  },
  messageActionsContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageActionsReactions: {
    flexDirection: 'row',
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.sm,
    gap: spacing.xs,
    ...premiumShadows.large,
  },
  messageActionsReactionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageActionsReactionEmoji: {
    fontSize: 26,
  },
  messageActionsMenu: {
    width: '100%',
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
    ...premiumShadows.large,
  },
  messageActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  messageActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageActionText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  messageActionDivider: {
    height: 0.5,
    marginLeft: 60,
  },
  messageActionsCancelBtn: {
    width: '100%',
    borderRadius: premiumBorderRadius.lg,
    paddingVertical: spacing.md + 4,
    alignItems: 'center',
    ...premiumShadows.large,
  },
  messageActionsCancelText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#007AFF',
  },
  swipeReplyContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  swipeReplyContainerRight: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  swipeReplyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  swipeDeleteContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  swipeDeleteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  reactionCount: {
    position: 'absolute',
    bottom: -12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    gap: 3,
    zIndex: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  reactionCountEmoji: {
    fontSize: 14,
  },
  reactionCountText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
  messageWrapper: {
    position: 'relative',
  },
  doubleTapHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  doubleTapHeartEmoji: {
    fontSize: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  joinToParticipate: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  joinToParticipateText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  joinCompactBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    ...premiumShadows.sm,
  },
  joinCompactBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  securityOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  securityCard: {
    width: '100%',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    ...premiumShadows.lg,
  },
  securityIconContainer: {
    marginBottom: 24,
  },
  securityIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...premiumShadows.md,
  },
  securityTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  securityMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  securityFeatures: {
    width: '100%',
    gap: 14,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityFeatureText: {
    fontSize: 15,
    fontWeight: '500',
  },
  securityButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  securityButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  securityButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  securitySecondaryButton: {
    paddingVertical: 12,
  },
  securitySecondaryText: {
    fontSize: 14,
    textAlign: 'center',
  },
  groupPreviewCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  groupPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  groupPreviewImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupPreviewInfo: {
    flex: 1,
  },
  groupPreviewName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  groupPreviewMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  groupPreviewDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },

  resourceSecurityCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  resourceSecurityIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resourceSecurityTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  resourceSecurityText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  resourceSecurityBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 160,
  },
  resourceSecurityBtnGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  resourceSecurityBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // WhatsApp Style Header
  whatsappHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#7B2D96',
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  whatsappHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  whatsappBackBtn: {
    padding: 8,
  },
  whatsappGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  whatsappGroupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  whatsappGroupAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  whatsappGroupTextContainer: {
    flex: 1,
  },
  whatsappGroupName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  whatsappGroupMembers: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  whatsappHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappHeaderIcon: {
    padding: 10,
  },

  // WhatsApp Chat Area
  whatsappChatArea: {
    flex: 1,
    backgroundColor: '#0B141A',
  },
  whatsappChatContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 20,
  },

  // WhatsApp Date Separator
  whatsappDateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  whatsappDateBubble: {
    backgroundColor: '#182229',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  whatsappDateText: {
    color: '#8696A0',
    fontSize: 12,
    fontWeight: '500',
  },

  // WhatsApp Empty Chat
  whatsappEmptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  whatsappEmptyIcon: {
    marginBottom: 20,
  },
  whatsappEmptyTitle: {
    color: '#E9EDEF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  whatsappEmptyText: {
    color: '#8696A0',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // WhatsApp Input Container
  whatsappInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#0B141A',
    gap: 8,
  },
  whatsappAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1F2C34',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    maxHeight: 120,
  },
  whatsappInput: {
    flex: 1,
    color: '#E9EDEF',
    fontSize: 16,
    paddingVertical: 0,
    maxHeight: 100,
  },
  whatsappEmojiBtn: {
    padding: 4,
    marginLeft: 8,
  },
  whatsappMicBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B84FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // WhatsApp Join Prompt
  whatsappJoinPrompt: {
    backgroundColor: '#182229',
    padding: 16,
    alignItems: 'center',
  },
  whatsappJoinText: {
    color: '#8696A0',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  whatsappJoinBtn: {
    backgroundColor: '#00A884',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  whatsappJoinBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

