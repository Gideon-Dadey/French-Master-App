import React, { useState, useEffect, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-av';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { studyGroupsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width, height } = Dimensions.get('window');

// Message type constants
const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VOICE: 'voice',
  DOCUMENT: 'document',
  LINK: 'link',
};

// Reaction emojis
const REACTIONS = [
  { emoji: '👍', name: 'like' },
  { emoji: '❤️', name: 'love' },
  { emoji: '🔥', name: 'fire' },
  { emoji: '😂', name: 'laugh' },
  { emoji: '😮', name: 'wow' },
  { emoji: '🎉', name: 'celebrate' },
];

// Emoji categories for picker (500+ emojis)
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

// Helper function to format time ago
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

// Helper to detect URLs in text
const detectURL = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex);
};

// Get file icon based on extension
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
  const { groupId } = route.params;
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [discussionMessage, setDiscussionMessage] = useState('');
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'link' });
  
  // Advanced discussions state
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageReactions, setMessageReactions] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingVoice, setPlayingVoice] = useState(null);
  const [voiceProgress, setVoiceProgress] = useState({});
  const [soundObject, setSoundObject] = useState(null);
  const recordingTimerRef = useRef(null);
  const recordingAnimRef = useRef(new Animated.Value(1)).current;
  
  // Call state
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState(null); // 'voice' or 'video'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const callTimerRef = useRef(null);
  const callPulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animation refs
  const attachmentMenuAnim = useRef(new Animated.Value(0)).current;
  const reactionPickerAnim = useRef(new Animated.Value(0)).current;
  const discussionsScrollRef = useRef(null);

  useEffect(() => {
    loadGroup();
  }, [groupId]);
  
  // Animate attachment menu
  useEffect(() => {
    Animated.spring(attachmentMenuAnim, {
      toValue: showAttachmentMenu ? 1 : 0,
      tension: 65,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [showAttachmentMenu]);
  
  // Animate reaction picker
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
      setGroup(response.data.data);
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
    if (!user || !user._id || !group) return false;
    const userId = user._id.toString();
    return group.members?.some(member => {
      const memberId = typeof member.user === 'object' 
        ? member.user?._id?.toString() 
        : member.user?.toString();
      return memberId === userId;
    });
  };

  const isModerator = () => {
    if (!user || !group) return false;
    if (group.creator?._id === user._id || (typeof group.creator === 'string' && group.creator === user._id)) {
      return true;
    }
    return group.members?.some(member => 
      (typeof member.user === 'object' ? member.user._id : member.user) === user._id && member.role === 'moderator'
    );
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
      
      // Build message object with type and attachments
      let messageData = {
        message: discussionMessage.trim(),
        type: MESSAGE_TYPES.TEXT,
      };
      
      // Handle image attachment
      if (selectedImage) {
        messageData.type = MESSAGE_TYPES.IMAGE;
        messageData.attachment = {
          type: 'image',
          uri: selectedImage.uri,
          name: selectedImage.fileName || 'image.jpg',
        };
      }
      
      // Handle document attachment
      if (selectedDocument) {
        messageData.type = MESSAGE_TYPES.DOCUMENT;
        messageData.attachment = {
          type: 'document',
          uri: selectedDocument.uri,
          name: selectedDocument.name,
          size: selectedDocument.size,
        };
      }
      
      // Handle reply
      if (replyingTo) {
        messageData.replyTo = {
          id: replyingTo._id || replyingTo.id,
          userName: replyingTo.user?.name || 'Member',
          message: replyingTo.message?.substring(0, 50) + (replyingTo.message?.length > 50 ? '...' : ''),
        };
      }
      
      // Detect links in message
      const urls = detectURL(discussionMessage);
      if (urls && urls.length > 0 && !selectedImage && !selectedDocument) {
        messageData.type = MESSAGE_TYPES.LINK;
        messageData.links = urls;
      }

      await studyGroupsAPI.addDiscussion(groupId, JSON.stringify(messageData));
      
      // Clear all inputs
      setDiscussionMessage('');
      setSelectedImage(null);
      setSelectedDocument(null);
      setReplyingTo(null);
      setShowAttachmentMenu(false);
      
      loadGroup();
      
      // Scroll to bottom
      setTimeout(() => {
        discussionsScrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
      
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Pick image from gallery
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
  
  // Take photo with camera
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
  
  // Pick document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        setSelectedDocument(result.assets[0]);
        setSelectedImage(null);
        setShowAttachmentMenu(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };
  
  // Handle reaction
  const handleReaction = (messageIndex, reaction) => {
    setMessageReactions(prev => {
      const key = messageIndex.toString();
      const currentReactions = prev[key] || [];
      const existingIndex = currentReactions.findIndex(r => r.emoji === reaction.emoji);
      
      if (existingIndex >= 0) {
        // Remove reaction if already added
        return {
          ...prev,
          [key]: currentReactions.filter((_, i) => i !== existingIndex),
        };
      } else {
        // Add new reaction
        return {
          ...prev,
          [key]: [...currentReactions, { ...reaction, userId: user?._id }],
        };
      }
    });
    setShowReactionPicker(null);
  };
  
  // Open image in full screen
  const openImagePreview = (imageUri) => {
    setPreviewImage(imageUri);
    setShowImagePreview(true);
  };
  
  // Cancel attachment
  const cancelAttachment = () => {
    setSelectedImage(null);
    setSelectedDocument(null);
  };
  
  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  // Insert emoji into message
  const insertEmoji = (emoji) => {
    setDiscussionMessage(prev => prev + emoji);
  };
  
  // Download image to device gallery
  const downloadImage = async (imageUri) => {
    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images to your gallery');
        return;
      }
      
      Alert.alert('Downloading...', 'Saving image to your gallery');
      
      const filename = `StudyGroup_${Date.now()}.jpg`;
      const fileUri = FileSystem.documentDirectory + filename;
      let finalUri = fileUri;
      
      // Check if it's a local file or remote URL
      if (imageUri.startsWith('file://')) {
        // Local file - copy instead of download
        await FileSystem.copyAsync({
          from: imageUri,
          to: fileUri
        });
        finalUri = fileUri;
      } else {
        // Remote URL - download
        const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);
        if (downloadResult.status !== 200) {
          throw new Error('Download failed');
        }
        finalUri = downloadResult.uri;
      }
      
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(finalUri);
      await MediaLibrary.createAlbumAsync('French Master', asset, false);
      
      Alert.alert('Success! 🎉', 'Image saved to your gallery in "French Master" album');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download image. Please try again.');
    }
  };
  
  // Share image
  const shareImage = async (imageUri) => {
    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return;
      }
      
      let shareUri = imageUri;
      
      // If it's a local file, we can share directly
      if (imageUri.startsWith('file://')) {
        shareUri = imageUri;
      } else {
        // Remote URL - download to temp file first
        const filename = `share_${Date.now()}.jpg`;
        const fileUri = FileSystem.cacheDirectory + filename;
        const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);
        if (downloadResult.status === 200) {
          shareUri = downloadResult.uri;
        }
      }
      
      await Sharing.shareAsync(shareUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Image',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share image. Please try again.');
    }
  };
  
  // Download document
  const downloadDocument = async (docUri, docName) => {
    try {
      Alert.alert('Downloading...', `Saving ${docName}`);
      
      const fileUri = FileSystem.documentDirectory + docName;
      let finalUri = fileUri;
      
      // Check if it's a local file or remote URL
      if (docUri.startsWith('file://')) {
        // Local file - copy instead of download
        await FileSystem.copyAsync({
          from: docUri,
          to: fileUri
        });
        finalUri = fileUri;
      } else {
        // Remote URL - download
        const downloadResult = await FileSystem.downloadAsync(docUri, fileUri);
        if (downloadResult.status !== 200) {
          throw new Error('Download failed');
        }
        finalUri = downloadResult.uri;
      }
      
      // Share the document (this allows user to save it)
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(finalUri, {
          dialogTitle: `Save ${docName}`,
        });
      } else {
        Alert.alert('Downloaded', `File saved to app storage: ${docName}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download document. Please try again.');
    }
  };
  
  // Share document
  const shareDocument = async (docUri, docName) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return;
      }
      
      let shareUri = docUri;
      
      // If it's a local file, we can share directly
      if (docUri.startsWith('file://')) {
        shareUri = docUri;
      } else {
        // Remote URL - download to temp file first
        const fileUri = FileSystem.cacheDirectory + docName;
        const downloadResult = await FileSystem.downloadAsync(docUri, fileUri);
        if (downloadResult.status === 200) {
          shareUri = downloadResult.uri;
        }
      }
      
      await Sharing.shareAsync(shareUri, {
        dialogTitle: `Share ${docName}`,
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share document. Please try again.');
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      // Prevent starting if already recording
      if (isRecording || recording) {
        console.log('Already recording, ignoring start request');
        return;
      }
      
      console.log('Starting recording...');
      
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      console.log('Permission status:', permission);
      
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow microphone access to send voice messages');
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      console.log('Recording started');
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimRef, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimRef, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) {
        console.log('No recording to stop');
        return null;
      }

      console.log('Stopping recording...');

      // Stop timer and animation
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      recordingAnimRef.stopAnimation();
      recordingAnimRef.setValue(1);

      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const duration = recordingDuration;
      
      console.log('Recording stopped, URI:', uri);
      
      setRecording(null);
      setRecordingDuration(0);

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      return { uri, duration };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      return null;
    }
  };

  const cancelRecording = async () => {
    try {
      if (!recording) return;

      // Stop timer and animation
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      recordingAnimRef.stopAnimation();
      recordingAnimRef.setValue(1);

      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setRecordingDuration(0);

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  };

  const sendVoiceMessage = async () => {
    const voiceData = await stopRecording();
    if (!voiceData || !voiceData.uri) {
      console.log('No voice data to send');
      return;
    }

    try {
      setSendingMessage(true);
      
      const messageData = {
        message: '🎤 Voice message',
        type: MESSAGE_TYPES.VOICE,
        attachment: {
          type: 'voice',
          uri: voiceData.uri,
          duration: voiceData.duration,
        },
      };

      if (replyingTo) {
        messageData.replyTo = {
          id: replyingTo._id || replyingTo.id,
          userName: replyingTo.user?.name || 'Member',
          message: replyingTo.message?.substring(0, 50) + (replyingTo.message?.length > 50 ? '...' : ''),
        };
      }

      await studyGroupsAPI.addDiscussion(groupId, JSON.stringify(messageData));
      setReplyingTo(null);
      loadGroup();
    } catch (error) {
      console.error('Send voice message error:', error);
      Alert.alert('Error', 'Failed to send voice message');
    } finally {
      setSendingMessage(false);
    }
  };

  const playVoiceMessage = async (voiceUri, messageId) => {
    try {
      // Stop any currently playing audio
      if (soundObject) {
        await soundObject.unloadAsync();
        setSoundObject(null);
        if (playingVoice === messageId) {
          setPlayingVoice(null);
          return;
        }
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Load and play the audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceUri },
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
      console.error('Error playing voice message:', error);
      Alert.alert('Error', 'Failed to play voice message');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [soundObject]);

  // Call Functions
  const startCall = (type) => {
    setCallType(type);
    setIsInCall(true);
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(type === 'video');
    setIsVideoOn(type === 'video');
    
    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Start pulse animation for connecting
    Animated.loop(
      Animated.sequence([
        Animated.timing(callPulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(callPulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Note: In a real app, you would connect to a WebRTC/VoIP service here
    // For demo, we're just showing the UI
  };
  
  const endCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    callPulseAnim.stopAnimation();
    callPulseAnim.setValue(1);
    
    setIsInCall(false);
    setCallType(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
    setIsVideoOn(true);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };
  
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };
  
  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };
  
  const formatCallDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddResource = async () => {
    if (!newResource.title.trim() || !newResource.url.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await studyGroupsAPI.addResource(groupId, newResource);
      setShowResourceModal(false);
      setNewResource({ title: '', url: '', type: 'link' });
      loadGroup();
      Alert.alert('Success', 'Resource added successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add resource');
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (error || !group) {
    return <ErrorMessage message={error || 'Study group not found'} onRetry={loadGroup} />;
  }

  const member = isMember();
  const moderator = isModerator();
  const memberCount = group.members?.length || 0;

  // Full-screen chat view for discussions
  if (activeTab === 'discussions') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Chat Header */}
        <LinearGradient
          colors={isDarkMode 
            ? [premiumColors.primary.main, '#1a0a2e']
            : [premiumColors.primary.main, '#7B1FA2']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chatHeader}
        >
          <View style={styles.chatHeaderContent}>
            <TouchableOpacity 
              style={styles.chatBackButton}
              onPress={() => setActiveTab('about')}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.chatHeaderInfo}
              onPress={() => setActiveTab('about')}
            >
              <View style={styles.chatHeaderGroupIcon}>
                <Ionicons name="people" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.chatHeaderText}>
                <Text style={styles.chatHeaderTitle} numberOfLines={1}>
                  {group.name}
                </Text>
                <View style={styles.chatHeaderMeta}>
                  {/* Member avatars */}
                  <View style={styles.chatMemberAvatars}>
                    {group.members?.slice(0, 3).map((m, idx) => {
                      const memberUser = typeof m.user === 'object' ? m.user : null;
                      return memberUser?.avatar ? (
                        <Image
                          key={idx}
                          source={{ uri: memberUser.avatar }}
                          style={[styles.chatMemberAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                        />
                      ) : (
                        <View 
                          key={idx}
                          style={[styles.chatMemberAvatarPlaceholder, { marginLeft: idx > 0 ? -8 : 0 }]}
                        >
                          <Ionicons name="person" size={10} color="#FFFFFF" />
                        </View>
                      );
                    })}
                  </View>
                  <Text style={styles.chatHeaderSubtitle}>
                    {memberCount} members • {group.discussions?.length || 0} messages
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            
            <View style={styles.chatHeaderActions}>
              <TouchableOpacity style={styles.chatHeaderButton} onPress={() => startCall('voice')}>
                <Ionicons name="call-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatHeaderButton} onPress={() => startCall('video')}>
                <Ionicons name="videocam-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatHeaderButton}>
                <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        
        {/* Full Screen Chat Content */}
        <View style={styles.fullScreenChat}>
          {/* Messages List */}
          <ScrollView
            ref={discussionsScrollRef}
            style={styles.chatMessagesScrollView}
            contentContainerStyle={styles.chatMessagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => discussionsScrollRef.current?.scrollToEnd({ animated: false })}
          >
            {group.discussions?.length > 0 ? (
              group.discussions.map((discussion, index) => {
                const discussionUser = typeof discussion.user === 'object' ? discussion.user : null;
                const isOwnMessage = discussionUser?._id === user?._id;
                const reactions = messageReactions[index.toString()] || [];
                
                // Parse message data
                let messageData;
                try {
                  messageData = JSON.parse(discussion.message);
                } catch {
                  messageData = { message: discussion.message, type: MESSAGE_TYPES.TEXT };
                }
                
                return (
                  <View key={index} style={styles.messageWrapper}>
                    {/* Date separator */}
                    {index === 0 || new Date(discussion.createdAt).toDateString() !== 
                      new Date(group.discussions[index - 1]?.createdAt).toDateString() ? (
                      <View style={styles.dateSeparator}>
                        <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
                        <Text style={[styles.dateText, { color: colors.secondaryText, backgroundColor: colors.background }]}>
                          {new Date(discussion.createdAt).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                        <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
                      </View>
                    ) : null}
                    
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onLongPress={() => setShowReactionPicker(index)}
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
                          <View style={[styles.messageAvatarPlaceholder, { backgroundColor: premiumColors.primary.main + '20' }]}>
                            <Ionicons name="person" size={16} color={premiumColors.primary.main} />
                          </View>
                        )
                      )}
                      
                      <View style={[
                        styles.messageBubble,
                        isOwnMessage ? 
                          [styles.ownMessageBubble, { backgroundColor: '#007AFF' }] : 
                          [styles.otherMessageBubble, { backgroundColor: isDarkMode ? '#262629' : '#E9E9EB' }],
                        messageData.type === MESSAGE_TYPES.IMAGE && styles.imageBubble,
                        messageData.type === MESSAGE_TYPES.IMAGE && (isOwnMessage ? styles.ownImageBubble : styles.otherImageBubble),
                      ]}>
                        {/* iOS-style bubble tail - hide for image-only messages */}
                        {messageData.type !== MESSAGE_TYPES.IMAGE && (
                          <View style={[
                            isOwnMessage ? styles.ownBubbleTail : styles.otherBubbleTail,
                            { backgroundColor: isOwnMessage ? '#007AFF' : (isDarkMode ? '#262629' : '#E9E9EB') }
                          ]}>
                            <View style={[
                              styles.bubbleTailCover,
                              { backgroundColor: colors.background },
                              isOwnMessage ? styles.ownTailCover : styles.otherTailCover
                            ]} />
                          </View>
                        )}
                        {/* Author name - hide for image-only messages from others */}
                        {!isOwnMessage && messageData.type !== MESSAGE_TYPES.IMAGE && (
                          <Text style={[styles.messageAuthor, { color: premiumColors.primary.main }]}>
                            {discussionUser?.name || 'Member'}
                          </Text>
                        )}
                        
                        {/* Reply preview */}
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
                        
                        {/* Image attachment - iOS iMessage style */}
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
                        
                        {/* Document attachment */}
                        {messageData.type === MESSAGE_TYPES.DOCUMENT && messageData.attachment && (
                          <View style={[styles.documentAttachment, { 
                            backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.15)' : colors.background 
                          }]}>
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
                        
                        {/* Voice message - iOS style */}
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
                        
                        {/* Link preview */}
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
                        
                        {/* Message text - hide for voice-only messages */}
                        {messageData.message && messageData.type !== MESSAGE_TYPES.VOICE && (
                          <Text style={[styles.messageText, { color: isOwnMessage ? '#FFFFFF' : colors.text }]}>
                            {messageData.message}
                          </Text>
                        )}
                        
                        {/* Timestamp - hide for image-only messages */}
                        {(messageData.type !== MESSAGE_TYPES.IMAGE || messageData.message) && (
                          <View style={styles.messageFooter}>
                            <Text style={[styles.messageTime, { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.secondaryText }]}>
                              {formatTimeAgo(discussion.createdAt)}
                            </Text>
                            {isOwnMessage && (
                              <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
                            )}
                          </View>
                        )}
                      </View>
                      
                      {/* Reply action */}
                      <TouchableOpacity 
                        style={styles.messageReplyAction}
                        onPress={() => setReplyingTo({ ...discussion, user: discussionUser })}
                      >
                        <Ionicons name="arrow-undo-outline" size={16} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                    
                    {/* Reactions */}
                    {reactions.length > 0 && (
                      <View style={[styles.reactionsContainer, isOwnMessage ? styles.ownReactions : styles.otherReactions]}>
                        {reactions.map((reaction, rIndex) => (
                          <View key={rIndex} style={[styles.reactionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {/* Reaction picker */}
                    {showReactionPicker === index && (
                      <Animated.View 
                        style={[
                          styles.reactionPicker,
                          { backgroundColor: colors.card, borderColor: colors.border, opacity: reactionPickerAnim, transform: [{ scale: reactionPickerAnim }] },
                          premiumShadows.lg,
                          isOwnMessage ? styles.ownReactionPicker : styles.otherReactionPicker,
                        ]}
                      >
                        {REACTIONS.map((reaction) => (
                          <TouchableOpacity key={reaction.name} style={styles.reactionOption} onPress={() => handleReaction(index, reaction)}>
                            <Text style={styles.reactionOptionEmoji}>{reaction.emoji}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.reactionCloseButton} onPress={() => setShowReactionPicker(null)}>
                          <Ionicons name="close" size={16} color={colors.secondaryText} />
                        </TouchableOpacity>
                      </Animated.View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyDiscussions}>
                <LinearGradient
                  colors={[premiumColors.primary.main + '20', premiumColors.accent.emerald + '20']}
                  style={styles.emptyDiscussionsIcon}
                >
                  <Ionicons name="chatbubbles" size={48} color={premiumColors.primary.main} />
                </LinearGradient>
                <Text style={[styles.emptyDiscussionsTitle, { color: colors.text }]}>
                  Start the Conversation
                </Text>
                <Text style={[styles.emptyDiscussionsText, { color: colors.secondaryText }]}>
                  Be the first to share your thoughts with the group!
                </Text>
              </View>
            )}
          </ScrollView>
          
          {/* Input Area */}
          {member && (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
              {/* Reply preview */}
              {replyingTo && (
                <View style={[styles.replyingToContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                  <View style={[styles.replyingToBar, { backgroundColor: premiumColors.accent.emerald }]} />
                  <View style={styles.replyingToContent}>
                    <Text style={[styles.replyingToLabel, { color: premiumColors.accent.emerald }]}>
                      Replying to {replyingTo.user?.name || 'Member'}
                    </Text>
                    <Text style={[styles.replyingToText, { color: colors.secondaryText }]} numberOfLines={1}>
                      {(() => { try { return JSON.parse(replyingTo.message).message || replyingTo.message; } catch { return replyingTo.message; } })()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={cancelReply} style={styles.cancelReplyButton}>
                    <Ionicons name="close-circle" size={24} color={colors.secondaryText} />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Attachment preview */}
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
                        <Ionicons name={getFileIcon(selectedDocument.name).icon} size={24} color={getFileIcon(selectedDocument.name).color} />
                      </View>
                      <View style={styles.previewInfo}>
                        <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>{selectedDocument.name}</Text>
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
              
              {/* iOS-style Recording Overlay for fullscreen chat */}
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
              
              {/* Main input */}
              {!isRecording && (
              <View style={[styles.chatInputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.chatAttachButton, showAttachmentMenu && { backgroundColor: premiumColors.primary.main }]}
                  onPress={() => { setShowAttachmentMenu(!showAttachmentMenu); setShowEmojiPicker(false); }}
                >
                  <Ionicons name={showAttachmentMenu ? 'close' : 'add'} size={24} color={showAttachmentMenu ? '#FFFFFF' : premiumColors.primary.main} />
                </TouchableOpacity>
                
                <View style={[styles.chatInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.chatInput, { color: colors.text }]}
                    placeholder="Message..."
                    placeholderTextColor={colors.secondaryText}
                    value={discussionMessage}
                    onChangeText={setDiscussionMessage}
                    multiline
                    maxLength={1000}
                  />
                  <TouchableOpacity 
                    style={styles.chatEmojiButton}
                    onPress={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachmentMenu(false); }}
                  >
                    <Ionicons name={showEmojiPicker ? "happy" : "happy-outline"} size={24} color={showEmojiPicker ? premiumColors.primary.main : colors.secondaryText} />
                  </TouchableOpacity>
                </View>
                
                {/* Send or Microphone button */}
                {discussionMessage.trim() || selectedImage || selectedDocument ? (
                  <TouchableOpacity
                    style={[styles.chatSendButton, { backgroundColor: premiumColors.primary.main }]}
                    onPress={handleSendMessage}
                    disabled={sendingMessage}
                  >
                    {sendingMessage ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="send" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.chatSendButton, { backgroundColor: premiumColors.primary.main }]}
                    onPress={startRecording}
                  >
                    <Ionicons name="mic" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
              )}
              
              {/* Attachment menu */}
              {showAttachmentMenu && (
                <Animated.View style={[styles.chatAttachmentMenu, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                  <TouchableOpacity style={styles.chatAttachmentOption} onPress={pickImage}>
                    <LinearGradient colors={['#9C27B0', '#7B1FA2']} style={styles.chatAttachmentIconGradient}>
                      <Ionicons name="images" size={22} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.chatAttachmentLabel, { color: colors.text }]}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chatAttachmentOption} onPress={takePhoto}>
                    <LinearGradient colors={['#E91E63', '#C2185B']} style={styles.chatAttachmentIconGradient}>
                      <Ionicons name="camera" size={22} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.chatAttachmentLabel, { color: colors.text }]}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chatAttachmentOption} onPress={pickDocument}>
                    <LinearGradient colors={['#3F51B5', '#303F9F']} style={styles.chatAttachmentIconGradient}>
                      <Ionicons name="document" size={22} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.chatAttachmentLabel, { color: colors.text }]}>Document</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chatAttachmentOption} onPress={() => { setShowAttachmentMenu(false); startRecording(); }}>
                    <LinearGradient colors={['#FF5722', '#E64A19']} style={styles.chatAttachmentIconGradient}>
                      <Ionicons name="mic" size={22} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.chatAttachmentLabel, { color: colors.text }]}>Voice</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <EmojiPicker colors={colors} onSelectEmoji={insertEmoji} onClose={() => setShowEmojiPicker(false)} />
              )}
            </KeyboardAvoidingView>
          )}
        </View>
        
        {/* Modals */}
        <Modal visible={showImagePreview} transparent animationType="fade" onRequestClose={() => setShowImagePreview(false)}>
          <View style={styles.imagePreviewModal}>
            <TouchableOpacity style={styles.imagePreviewClose} onPress={() => setShowImagePreview(false)}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            {previewImage && <Image source={{ uri: previewImage }} style={styles.fullScreenImage} resizeMode="contain" />}
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
      </View>
    );
  }

  // Normal view for other tabs
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={isDarkMode 
            ? ['#1a0a2e', '#16213e', '#0f3460']
            : ['#E8EAF6', '#F3E5F5', '#E1BEE7']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
              </TouchableOpacity>
              {moderator && (
                <TouchableOpacity>
                  <Ionicons name="settings-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.groupName, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
              {group.name}
            </Text>
            <Text style={[styles.groupDescription, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              {group.description}
            </Text>
            <View style={styles.groupMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="people" size={16} color={isDarkMode ? '#FFFFFF' : '#424242'} />
                <Text style={[styles.metaText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                  {memberCount}/{group.maxMembers} members
                </Text>
              </View>
              {group.isPrivate && (
                <View style={styles.metaItem}>
                  <Ionicons name="lock-closed" size={16} color={isDarkMode ? '#FFFFFF' : '#424242'} />
                  <Text style={[styles.metaText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                    Private
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!member ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleJoin}
            >
              <Ionicons name="person-add" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Join Group</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              onPress={handleLeave}
            >
              <Ionicons name="exit-outline" size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Leave Group</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['about', 'members', 'discussions', 'resources'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                {
                  borderBottomColor: activeTab === tab ? premiumColors.primary.main : 'transparent',
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab ? premiumColors.primary.main : colors.secondaryText,
                    fontWeight: activeTab === tab ? '700' : '500',
                  },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <InfoSection title="Level" value={group.level || 'All'} colors={colors} />
            <InfoSection title="Focus" value={group.focus || 'General'} colors={colors} />
            {group.studyGoals?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Study Goals</Text>
                {group.studyGoals.map((goal, index) => (
                  <View key={index} style={[styles.goalItem, { backgroundColor: colors.card }]}>
                    <Ionicons name="checkmark-circle" size={16} color={premiumColors.accent.emerald} />
                    <Text style={[styles.goalText, { color: colors.text }]}>{goal}</Text>
                  </View>
                ))}
              </View>
            )}
            {group.meetingSchedule?.frequency && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Meeting Schedule</Text>
                <Text style={[styles.scheduleText, { color: colors.secondaryText }]}>
                  {group.meetingSchedule.frequency}
                  {group.meetingSchedule.dayOfWeek && ` - ${group.meetingSchedule.dayOfWeek}`}
                  {group.meetingSchedule.time && ` at ${group.meetingSchedule.time}`}
                </Text>
              </View>
            )}
            {group.tags?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {group.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.card }]}>
                      <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.tabContent}>
            {group.members?.map((member, index) => {
              const memberUser = typeof member.user === 'object' ? member.user : null;
              const isCreator = group.creator?._id === memberUser?._id || 
                               (typeof group.creator === 'string' && group.creator === member.user);
              return (
                <View key={index} style={[styles.memberCard, { backgroundColor: colors.card }]}>
                  {memberUser?.avatar ? (
                    <Image 
                      source={{ uri: memberUser.avatar }} 
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
                      <Ionicons name="person" size={24} color={premiumColors.primary.main} />
                    </View>
                  )}
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {memberUser?.name || 'Member'}
                      {isCreator && (
                        <Text style={[styles.creatorBadge, { color: premiumColors.accent.gold }]}>
                          {' '}(Creator)
                        </Text>
                      )}
                    </Text>
                    <Text style={[styles.memberRole, { color: colors.secondaryText }]}>
                      {member.role || 'member'}
                    </Text>
                  </View>
                  {moderator && !isCreator && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Remove Member',
                          `Remove ${memberUser?.name || 'this member'} from the group?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  await studyGroupsAPI.removeMember(groupId, member.user._id || member.user);
                                  loadGroup();
                                } catch (error) {
                                  Alert.alert('Error', error.response?.data?.message || 'Failed to remove member');
                                }
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error || '#FF3B30'} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'discussions' && (
          <View style={styles.discussionsContainer}>
            {/* Messages List */}
            <ScrollView
              ref={discussionsScrollRef}
              style={styles.messagesScrollView}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {group.discussions?.length > 0 ? (
                group.discussions.map((discussion, index) => {
                  const discussionUser = typeof discussion.user === 'object' ? discussion.user : null;
                  const isOwnMessage = discussionUser?._id === user?._id;
                  const reactions = messageReactions[index.toString()] || [];
                  
                  // Parse message data (handle both old and new format)
                  let messageData;
                  try {
                    messageData = JSON.parse(discussion.message);
                  } catch {
                    messageData = { message: discussion.message, type: MESSAGE_TYPES.TEXT };
                  }
                  
                  return (
                    <View key={index} style={styles.messageWrapper}>
                      {/* Date separator */}
                      {index === 0 || new Date(discussion.createdAt).toDateString() !== 
                        new Date(group.discussions[index - 1]?.createdAt).toDateString() ? (
                        <View style={styles.dateSeparator}>
                          <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
                          <Text style={[styles.dateText, { color: colors.secondaryText, backgroundColor: colors.background }]}>
                            {new Date(discussion.createdAt).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </Text>
                          <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
                        </View>
                      ) : null}
                      
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onLongPress={() => setShowReactionPicker(index)}
                        style={[
                          styles.messageContainer,
                          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
                        ]}
                      >
                        {/* Avatar for other users */}
                        {!isOwnMessage && (
                          discussionUser?.avatar ? (
                            <Image 
                              source={{ uri: discussionUser.avatar }} 
                              style={styles.messageAvatar}
                            />
                          ) : (
                            <View style={[styles.messageAvatarPlaceholder, { backgroundColor: premiumColors.primary.main + '20' }]}>
                              <Ionicons name="person" size={16} color={premiumColors.primary.main} />
                            </View>
                          )
                        )}
                        
                        <View style={[
                          styles.messageBubble,
                          isOwnMessage ? 
                            [styles.ownMessageBubble, { backgroundColor: '#007AFF' }] : 
                            [styles.otherMessageBubble, { backgroundColor: isDarkMode ? '#262629' : '#E9E9EB' }],
                          messageData.type === MESSAGE_TYPES.IMAGE && styles.imageBubble,
                          messageData.type === MESSAGE_TYPES.IMAGE && (isOwnMessage ? styles.ownImageBubble : styles.otherImageBubble),
                        ]}>
                          {/* iOS-style bubble tail - hide for image-only messages */}
                          {messageData.type !== MESSAGE_TYPES.IMAGE && (
                            <View style={[
                              isOwnMessage ? styles.ownBubbleTail : styles.otherBubbleTail,
                              { backgroundColor: isOwnMessage ? '#007AFF' : (isDarkMode ? '#262629' : '#E9E9EB') }
                            ]}>
                              <View style={[
                                styles.bubbleTailCover,
                                { backgroundColor: colors.background },
                                isOwnMessage ? styles.ownTailCover : styles.otherTailCover
                              ]} />
                            </View>
                          )}
                          {/* Author name for other users - hide for image-only messages */}
                          {!isOwnMessage && messageData.type !== MESSAGE_TYPES.IMAGE && (
                            <Text style={[styles.messageAuthor, { color: premiumColors.primary.main }]}>
                              {discussionUser?.name || 'Member'}
                            </Text>
                          )}
                          
                          {/* Reply preview */}
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
                          
                          {/* Image attachment - iOS iMessage style */}
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
                          
                          {/* Document attachment */}
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
                          
                          {/* Voice message - iOS style */}
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
                          
                          {/* Link preview */}
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
                          
                          {/* Message text - hide for voice-only messages */}
                          {messageData.message && messageData.type !== MESSAGE_TYPES.VOICE && (
                            <Text style={[
                              styles.messageText,
                              { color: isOwnMessage ? '#FFFFFF' : colors.text }
                            ]}>
                              {messageData.message}
                            </Text>
                          )}
                          
                          {/* Timestamp - hide for image-only messages */}
                          {(messageData.type !== MESSAGE_TYPES.IMAGE || messageData.message) && (
                            <View style={styles.messageFooter}>
                              <Text style={[styles.messageTime, { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.secondaryText }]}>
                                {formatTimeAgo(discussion.createdAt)}
                              </Text>
                              {isOwnMessage && (
                                <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
                              )}
                            </View>
                          )}
                        </View>
                        
                        {/* Message actions */}
                        <View style={styles.messageActions}>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => setReplyingTo({ ...discussion, user: discussionUser })}
                          >
                            <Ionicons name="arrow-undo-outline" size={16} color={colors.secondaryText} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Reactions */}
                      {reactions.length > 0 && (
                        <View style={[
                          styles.reactionsContainer,
                          isOwnMessage ? styles.ownReactions : styles.otherReactions,
                        ]}>
                          {reactions.map((reaction, rIndex) => (
                            <View key={rIndex} style={[styles.reactionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      
                      {/* Reaction picker */}
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
                <View style={styles.emptyDiscussions}>
                  <LinearGradient
                    colors={[premiumColors.primary.main + '20', premiumColors.accent.emerald + '20']}
                    style={styles.emptyDiscussionsIcon}
                  >
                    <Ionicons name="chatbubbles" size={48} color={premiumColors.primary.main} />
                  </LinearGradient>
                  <Text style={[styles.emptyDiscussionsTitle, { color: colors.text }]}>
                    Start the Conversation
                  </Text>
                  <Text style={[styles.emptyDiscussionsText, { color: colors.secondaryText }]}>
                    Be the first to share your thoughts, images, or documents with the group!
                  </Text>
                </View>
              )}
            </ScrollView>
            
            {/* Input Area */}
            {member && (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
              >
                {/* Reply preview */}
                {replyingTo && (
                  <View style={[styles.replyingToContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <View style={[styles.replyingToBar, { backgroundColor: premiumColors.accent.emerald }]} />
                    <View style={styles.replyingToContent}>
                      <Text style={[styles.replyingToLabel, { color: premiumColors.accent.emerald }]}>
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
                    <TouchableOpacity onPress={cancelReply} style={styles.cancelReplyButton}>
                      <Ionicons name="close-circle" size={24} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Attachment preview */}
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
                
                {/* Main input container */}
                <View style={[styles.advancedInputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                  {/* Attachment button */}
                  <TouchableOpacity 
                    style={[styles.attachButton, { backgroundColor: showAttachmentMenu ? premiumColors.primary.main : 'transparent' }]}
                    onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  >
                    <Ionicons 
                      name={showAttachmentMenu ? 'close' : 'add-circle'} 
                      size={26} 
                      color={showAttachmentMenu ? '#FFFFFF' : premiumColors.primary.main} 
                    />
                  </TouchableOpacity>
                  
                  {/* Text input */}
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.advancedInput, { color: colors.text }]}
                      placeholder="Type a message..."
                      placeholderTextColor={colors.secondaryText}
                      value={discussionMessage}
                      onChangeText={setDiscussionMessage}
                      multiline
                      maxLength={1000}
                    />
                    
                    {/* Emoji button */}
                    <TouchableOpacity 
                      style={styles.emojiButton}
                      onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Ionicons 
                        name={showEmojiPicker ? "happy" : "happy-outline"} 
                        size={22} 
                        color={showEmojiPicker ? premiumColors.primary.main : colors.secondaryText} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Send or Microphone button */}
                  {discussionMessage.trim() || selectedImage || selectedDocument ? (
                    <TouchableOpacity
                      style={[
                        styles.sendMessageButton,
                        { backgroundColor: premiumColors.primary.main },
                      ]}
                      onPress={handleSendMessage}
                      disabled={sendingMessage}
                    >
                      {sendingMessage ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.sendMessageButton,
                        { backgroundColor: isRecording ? '#FF3B30' : premiumColors.primary.main },
                      ]}
                      onPress={isRecording ? sendVoiceMessage : startRecording}
                      onLongPress={startRecording}
                    >
                      <Animated.View style={{ transform: [{ scale: isRecording ? recordingAnimRef : 1 }] }}>
                        <Ionicons 
                          name={isRecording ? "stop" : "mic"} 
                          size={20} 
                          color="#FFFFFF" 
                        />
                      </Animated.View>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* iOS-style Recording Overlay */}
                {isRecording && (
                  <View style={styles.recordingOverlay}>
                    <LinearGradient
                      colors={['rgba(255,59,48,0.95)', 'rgba(255,45,85,0.95)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.recordingOverlayGradient}
                    >
                      {/* Cancel button */}
                      <TouchableOpacity 
                        style={styles.recordingCancelBtn}
                        onPress={cancelRecording}
                      >
                        <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                      </TouchableOpacity>
                      
                      {/* Waveform and timer */}
                      <View style={styles.recordingCenter}>
                        {/* Animated waveform */}
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
                        
                        {/* Recording indicator and timer */}
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
                      
                      {/* Send button */}
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
                
                {/* Attachment menu */}
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
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <EmojiPicker 
                    colors={colors}
                    onSelectEmoji={insertEmoji}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </KeyboardAvoidingView>
            )}
          </View>
        )}

        {activeTab === 'resources' && (
          <View style={styles.tabContent}>
            {member && (
              <TouchableOpacity
                style={[styles.addResourceButton, { backgroundColor: premiumColors.primary.main }]}
                onPress={() => setShowResourceModal(true)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addResourceText}>Add Resource</Text>
              </TouchableOpacity>
            )}
            {group.resources?.length > 0 ? (
              group.resources.map((resource, index) => {
                const resourceUser = typeof resource.addedBy === 'object' ? resource.addedBy : null;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.resourceCard, { backgroundColor: colors.card }]}
                    onPress={() => {
                      if (resource.url) {
                        // Open URL - you might want to use Linking here
                        Alert.alert('Resource', `Open ${resource.url}?`);
                      }
                    }}
                  >
                    <Ionicons
                      name={resource.type === 'video' ? 'videocam' : resource.type === 'document' ? 'document' : 'link'}
                      size={24}
                      color={premiumColors.primary.main}
                    />
                    <View style={styles.resourceInfo}>
                      <Text style={[styles.resourceTitle, { color: colors.text }]}>{resource.title}</Text>
                      <Text style={[styles.resourceMeta, { color: colors.secondaryText }]}>
                        Added by {resourceUser?.name || 'Member'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-outline" size={48} color={colors.secondaryText} />
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  No resources yet. Add your first resource!
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Join Modal */}
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

      {/* Add Resource Modal */}
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
      
      {/* Call Modal */}
      <Modal
        visible={isInCall}
        transparent={false}
        animationType="slide"
        onRequestClose={endCall}
        statusBarTranslucent
      >
        <View style={styles.callModal}>
          {/* Background gradient */}
          <LinearGradient
            colors={callType === 'video' ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#667eea', '#764ba2', '#6B8DD6']}
            style={styles.callBackground}
          >
            {/* Video preview area (for video calls) */}
            {callType === 'video' && (
              <View style={styles.videoContainer}>
                {isVideoOn ? (
                  <View style={styles.videoPlaceholder}>
                    <LinearGradient
                      colors={['#2d3436', '#636e72']}
                      style={styles.videoPlaceholderGradient}
                    >
                      <Ionicons name="videocam" size={60} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.videoPlaceholderText}>Camera Preview</Text>
                    </LinearGradient>
                  </View>
                ) : (
                  <View style={styles.videoOff}>
                    <View style={styles.videoOffIcon}>
                      <Ionicons name="videocam-off" size={40} color="#FFFFFF" />
                    </View>
                    <Text style={styles.videoOffText}>Camera is off</Text>
                  </View>
                )}
                
                {/* Self view (small) */}
                <View style={styles.selfVideoContainer}>
                  <LinearGradient
                    colors={['#4a4a4a', '#2d2d2d']}
                    style={styles.selfVideo}
                  >
                    {isVideoOn ? (
                      <Ionicons name="person" size={30} color="rgba(255,255,255,0.5)" />
                    ) : (
                      <Ionicons name="videocam-off" size={20} color="rgba(255,255,255,0.5)" />
                    )}
                  </LinearGradient>
                </View>
              </View>
            )}
            
            {/* Voice call UI */}
            {callType === 'voice' && (
              <View style={styles.voiceCallContainer}>
                {/* Group avatar */}
                <Animated.View style={[
                  styles.callAvatarContainer,
                  { transform: [{ scale: callPulseAnim }] }
                ]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.callAvatarRing}
                  >
                    <View style={styles.callAvatar}>
                      <Ionicons name="people" size={50} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                </Animated.View>
                
                {/* Group name */}
                <Text style={styles.callGroupName}>{group?.name}</Text>
                
                {/* Call status */}
                <Text style={styles.callStatus}>
                  {callDuration > 0 ? formatCallDuration(callDuration) : 'Connecting...'}
                </Text>
                
                {/* Participants */}
                <View style={styles.callParticipants}>
                  <Text style={styles.callParticipantsText}>
                    {memberCount} participants
                  </Text>
                </View>
              </View>
            )}
            
            {/* Call info for video */}
            {callType === 'video' && (
              <View style={styles.videoCallInfo}>
                <Text style={styles.videoCallName}>{group?.name}</Text>
                <Text style={styles.videoCallDuration}>
                  {callDuration > 0 ? formatCallDuration(callDuration) : 'Connecting...'}
                </Text>
              </View>
            )}
            
            {/* Call controls */}
            <View style={styles.callControls}>
              {/* Top row of controls */}
              <View style={styles.callControlsRow}>
                {/* Mute button */}
                <TouchableOpacity 
                  style={[styles.callControlBtn, isMuted && styles.callControlBtnActive]}
                  onPress={toggleMute}
                >
                  <Ionicons 
                    name={isMuted ? "mic-off" : "mic"} 
                    size={26} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.callControlLabel}>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>
                
                {/* Speaker/Audio button */}
                <TouchableOpacity 
                  style={[styles.callControlBtn, isSpeakerOn && styles.callControlBtnActive]}
                  onPress={toggleSpeaker}
                >
                  <Ionicons 
                    name={isSpeakerOn ? "volume-high" : "volume-medium"} 
                    size={26} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.callControlLabel}>
                    {isSpeakerOn ? 'Speaker' : 'Phone'}
                  </Text>
                </TouchableOpacity>
                
                {/* Video toggle (for video calls) */}
                {callType === 'video' && (
                  <TouchableOpacity 
                    style={[styles.callControlBtn, !isVideoOn && styles.callControlBtnActive]}
                    onPress={toggleVideo}
                  >
                    <Ionicons 
                      name={isVideoOn ? "videocam" : "videocam-off"} 
                      size={26} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.callControlLabel}>
                      {isVideoOn ? 'Video' : 'Video Off'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {/* Flip camera (for video calls) */}
                {callType === 'video' && (
                  <TouchableOpacity 
                    style={styles.callControlBtn}
                    onPress={toggleCamera}
                  >
                    <Ionicons name="camera-reverse" size={26} color="#FFFFFF" />
                    <Text style={styles.callControlLabel}>Flip</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* End call button */}
              <TouchableOpacity 
                style={styles.endCallBtn}
                onPress={endCall}
              >
                <LinearGradient
                  colors={['#FF3B30', '#FF453A']}
                  style={styles.endCallBtnGradient}
                >
                  <Ionicons name="call" size={30} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
      
      {/* Image Preview Modal */}
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
    </View>
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

// Emoji Picker Component
function EmojiPicker({ colors, onSelectEmoji, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [recentEmojis, setRecentEmojis] = useState(['😀', '😂', '❤️', '👍', '🔥', '🎉', '😊', '🙏']);
  
  const handleEmojiSelect = (emoji) => {
    onSelectEmoji(emoji);
    // Add to recent (keep last 8)
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      return [emoji, ...filtered].slice(0, 8);
    });
  };
  
  return (
    <View style={[styles.emojiPickerContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      {/* Header with search hint and close */}
      <View style={styles.emojiPickerHeader}>
        <Text style={[styles.emojiPickerTitle, { color: colors.text }]}>Emojis</Text>
        <TouchableOpacity onPress={onClose} style={styles.emojiPickerClose}>
          <Ionicons name="chevron-down" size={24} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>
      
      {/* Recent emojis */}
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
      
      {/* Category tabs */}
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
      
      {/* Emoji grid */}
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
  
  // Advanced Discussions Styles
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
  // iOS-style bubble tail for own messages
  ownBubbleTail: {
    position: 'absolute',
    bottom: 0,
    right: -6,
    width: 12,
    height: 16,
  },
  // iOS-style bubble tail for other messages
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
  
  // Reply preview in message - iOS style
  replyPreview: {
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 2,
    marginBottom: 6,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
  },
  
  // Image attachment - iOS iMessage style
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
  // iOS-style image message wrapper
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
  
  // Document attachment
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
  
  // Voice message styles - iOS style
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
  
  // iOS-style Recording Overlay
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
  
  // Link preview
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
  
  // Reactions
  reactionsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: -8,
    paddingHorizontal: 36,
  },
  ownReactions: {
    justifyContent: 'flex-end',
  },
  otherReactions: {
    justifyContent: 'flex-start',
  },
  reactionBubble: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  
  // Reaction picker
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
  
  // Empty discussions state
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
  
  // Advanced input container
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
  
  // Attachment menu
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
  
  // Replying to container
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
  },
  replyingToBar: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: spacing.md,
  },
  replyingToContent: {
    flex: 1,
  },
  replyingToLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginBottom: 2,
  },
  replyingToText: {
    fontSize: fontSize.sm,
  },
  cancelReplyButton: {
    padding: spacing.xs,
  },
  
  // Attachment preview
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
  
  // Call modal styles
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
  
  // Image preview modal
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
  
  // Full Screen Chat Styles
  chatHeader: {
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  chatHeaderGroupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  chatHeaderTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  chatMemberAvatars: {
    flexDirection: 'row',
    marginRight: spacing.xs,
  },
  chatMemberAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chatMemberAvatarPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chatHeaderSubtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
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
  
  // Emoji Picker Styles
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
});

