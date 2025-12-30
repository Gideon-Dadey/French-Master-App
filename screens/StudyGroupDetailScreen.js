// StudyGroupDetailScreen - WhatsApp-style chat with keyboard handling
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
  Keyboard,
} from 'react-native';
import { GestureHandlerRootView, Swipeable, TapGestureHandler, State } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize, colors as themeColors } from '../src/utils/responsive';
import { studyGroupsAPI, uploadsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import socketService from '../src/services/socketService';

// Extracted Components
import MessageBubble from '../src/components/studyGroups/MessageBubble';
import ChatInput from '../src/components/studyGroups/ChatInput';
import AttachmentMenu from '../src/components/studyGroups/AttachmentMenu';
import RecordingOverlay from '../src/components/studyGroups/RecordingOverlay';

// Chat Utilities
import {
  formatTimeAgo,
  getFileIcon,
  formatDuration,
  MESSAGE_TYPES,
  REACTIONS,
  detectURL
} from '../src/utils/chatUtils';

const { width, height } = Dimensions.get('window');
// ... rest of constants ...

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

export default function StudyGroupDetailScreen({ route, navigation }) {
  const { groupId, initialTab = 'discussions' } = route.params;
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
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
  const [isVideoSwapped, setIsVideoSwapped] = useState(false);
  const [soundObject, setSoundObject] = useState(null);
  const recordingTimerRef = useRef(null);
  const recordingAnimRef = useRef(new Animated.Value(1)).current;

  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); // { callerName, type, callerId, groupId }
  const [callType, setCallType] = useState(null);
  const [callStatus, setCallStatus] = useState('Connecting...');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const callTimerRef = useRef(null);
  const callPulseAnim = useRef(new Animated.Value(1)).current;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const swipeableRefs = useRef(new Map());

  // Chat background customization
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [chatBackground, setChatBackground] = useState(null); // { type: 'color' | 'image', value: string }

  // Keyboard state for Android proper handling
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Keyboard event listeners for proper input visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          discussionsScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Load saved background on mount
  useEffect(() => {
    const loadSavedBackground = async () => {
      try {
        const savedBackground = await AsyncStorage.getItem(`chat_background_${groupId}`);
        if (savedBackground) {
          setChatBackground(JSON.parse(savedBackground));
        }
      } catch (error) {
        console.log('Failed to load saved background:', error);
      }
    };
    loadSavedBackground();
  }, [groupId]);

  // Save background when it changes
  useEffect(() => {
    const saveBackground = async () => {
      try {
        if (chatBackground) {
          await AsyncStorage.setItem(`chat_background_${groupId}`, JSON.stringify(chatBackground));
        } else {
          await AsyncStorage.removeItem(`chat_background_${groupId}`);
        }
      } catch (error) {
        console.log('Failed to save background:', error);
      }
    };
    saveBackground();
  }, [chatBackground, groupId]);

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

  // Typing indicator logic
  useEffect(() => {
    if (discussionMessage.trim()) {
      socketService.emitTyping(groupId, user?.name || 'Someone');

      const timeout = setTimeout(() => {
        // We could emit a "stopped typing" if needed, 
        // but the current server implementation just waits for a timeout or next message
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [discussionMessage]);

  // Socket setup
  useEffect(() => {
    socketService.connect();
    socketService.joinGroup(groupId);

    socketService.onNewMessage(({ message }) => {
      setGroup(prevGroup => {
        if (!prevGroup) return prevGroup;
        // Avoid duplicate messages if the sender already added it via REST response
        const messageExists = prevGroup.discussions.some(d => d._id === message._id);
        if (messageExists) return prevGroup;

        return {
          ...prevGroup,
          discussions: [...prevGroup.discussions, message]
        };
      });

      // Scroll to bottom
      setTimeout(() => {
        discussionsScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    socketService.onUserTyping(({ userName }) => {
      if (userName === user?.name) return; // Don't show our own typing

      setTypingUsers(prev => {
        if (prev.includes(userName)) return prev;
        return [...prev, userName];
      });

      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u !== userName));
      }, 3000);
    });

    socketService.onIncomingCall(({ callerName, type, callerId, groupId: callGroupId }) => {
      if (callGroupId === groupId && !isInCall) {
        setIncomingCall({ callerName, type, callerId, callGroupId });
      }
    });

    socketService.onCallAccepted(({ accepterName }) => {
      console.log(`Call accepted by ${accepterName}`);
      setCallStatus('In Call');
    });

    socketService.onCallRejected(() => {
      Alert.alert('Call Rejected', 'The call was declined.');
      endCall();
    });

    return () => {
      socketService.leaveGroup(groupId);
      socketService.removeListener('new_message');
      socketService.removeListener('user_typing');
      socketService.removeListener('incoming_call');
      socketService.removeListener('call_accepted');
      socketService.removeListener('call_rejected');
    };
  }, [groupId]);

  useEffect(() => {
    loadGroup();
  }, [groupId, user?._id]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => { });
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (soundObject) {
        soundObject.unloadAsync().catch(() => { });
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

  const startCall = async (type) => {
    // Request camera permission for video calls
    if (type === 'video' && !cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to make video calls.',
          [{ text: 'OK' }]
        );
      }
    }

    // Emit call to group
    socketService.emitCall(groupId, user?.name || 'Someone', type);

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

    // Notify others if we are the one ending it
    socketService.socket?.emit('end_call', { groupId });
  };

  const acceptCall = () => {
    if (incomingCall) {
      socketService.emitAcceptCall(incomingCall.callerId, user?.name || 'Someone');
      setCallType(incomingCall.type);
      setIsInCall(true);
      setIncomingCall(null);
      setShowVoiceCall(true);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socketService.emitRejectCall(incomingCall.callerId);
      setIncomingCall(null);
    }
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
      setEditGroupImageLoading(true);
      let imageUrl = editGroupData.image;

      // If it's a local URI (from Picker), upload it first
      if (imageUrl && (imageUrl.startsWith('file://') || imageUrl.startsWith('content://'))) {
        const uploadRes = await uploadsAPI.uploadImage({
          uri: imageUrl,
          type: 'image/jpeg',
          name: `group_${groupId}_${Date.now()}.jpg`
        });
        imageUrl = uploadRes.data.url;
      }

      const updateData = {
        name: editGroupData.name,
        description: editGroupData.description,
        level: editGroupData.level,
        focus: editGroupData.focus,
        maxMembers: editGroupData.maxMembers,
        isPrivate: editGroupData.isPrivate,
        image: imageUrl
      };

      await studyGroupsAPI.update(groupId, updateData);

      Alert.alert('Success', 'Group settings updated successfully');
      setShowEditGroup(false);
      loadGroup();
    } catch (error) {
      console.error('Update group error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update group');
    } finally {
      setEditGroupImageLoading(false);
    }
  };

  const pickGroupImage = async () => {
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
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]) {
        setEditGroupData(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takeGroupPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]) {
        setEditGroupData(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showGroupImageOptions = () => {
    Alert.alert(
      'Change Group Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takeGroupPhoto },
        { text: 'Choose from Library', onPress: pickGroupImage },
        { text: 'Remove Photo', style: 'destructive', onPress: () => setEditGroupData(prev => ({ ...prev, image: null })) },
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

  // Chat background functions
  const openBackgroundPicker = () => {
    setShowBackgroundPicker(true);
  };

  const closeBackgroundPicker = () => {
    setShowBackgroundPicker(false);
  };

  const pickBackgroundImage = async () => {
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
      });

      if (!result.canceled && result.assets[0]) {
        setChatBackground({ type: 'image', value: result.assets[0].uri });
        closeBackgroundPicker();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const setBackgroundColor = (color) => {
    setChatBackground({ type: 'color', value: color });
    closeBackgroundPicker();
  };

  const setBackgroundPattern = (pattern) => {
    setChatBackground({ type: 'pattern', value: pattern });
    closeBackgroundPicker();
  };

  const resetBackground = () => {
    setChatBackground(null);
    closeBackgroundPicker();
  };

  const downloadDocument = async (uri, filename) => {
    try {
      if (!uri) return;

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Use sharing to open/save the document
        await Sharing.shareAsync(uri, {
          mimeType: '*/*',
          dialogTitle: `Open ${filename}`,
          UTI: 'public.item', // iOS
        });
      } else {
        // Fallback: Show alert with options
        Alert.alert(
          'Document',
          `${filename}\n\nSharing is not available on this device.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Could not open document. Please try again.');
    }
  };

  const shareDocument = async (uri, filename) => {
    try {
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/octet-stream',
          dialogTitle: `Share ${filename}`,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Could not share document');
    }
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
        allowsEditing: false,
        quality: 0.8,
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
        allowsEditing: false,
        quality: 0.8,
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
        copyToCacheDirectory: true,
      });

      // Handle new DocumentPicker API (Expo SDK 49+)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const doc = result.assets[0];
        setSelectedDocument({
          uri: doc.uri,
          name: doc.name,
          size: doc.size,
          mimeType: doc.mimeType,
        });
        setSelectedImage(null); // Clear any selected image
        setShowAttachmentMenu(false);
      }
      // Handle old DocumentPicker API
      else if (result.type === 'success') {
        setSelectedDocument({
          uri: result.uri,
          name: result.name,
          size: result.size,
          mimeType: result.mimeType,
        });
        setSelectedImage(null); // Clear any selected image
        setShowAttachmentMenu(false);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const shareImage = async (uri) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share image');
    }
  };

  const downloadImage = async (uri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to media library to save images.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const renderIncomingCallModal = () => (
    <Modal visible={!!incomingCall} transparent animationType="slide">
      <View style={styles.incomingCallOverlay}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.incomingCallContent}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.incomingCallAvatar}
          >
            <Ionicons name="call" size={40} color="#FFF" />
          </LinearGradient>

          <Text style={styles.incomingCallTitle}>Incoming {incomingCall?.type} Call</Text>
          <Text style={styles.incomingCallName}>{incomingCall?.callerName}</Text>
          <Text style={styles.incomingCallGroup}>{group?.name}</Text>

          <View style={styles.incomingCallActions}>
            <TouchableOpacity
              style={[styles.callActionBtn, { backgroundColor: '#FF3B30' }]}
              onPress={rejectCall}
            >
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callActionBtn, { backgroundColor: '#4CD964' }]}
              onPress={acceptCall}
            >
              <Ionicons name="checkmark" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
          {/* Main Card */}
          <View style={[styles.premiumActionSheet, { backgroundColor: colors.card }]}>
            {/* Header Area with Gradient Background */}
            <LinearGradient
              colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#F1F5F9']}
              style={styles.actionSheetHeaderPremium}
            >
              <View style={styles.actionSheetGroupInfoPremium}>
                <View style={styles.actionSheetAvatarWrapper}>
                  {group?.image ? (
                    <Image source={{ uri: group.image }} style={styles.actionSheetAvatarPremium} />
                  ) : (
                    <LinearGradient
                      colors={[premiumColors.primary.main, premiumColors.primary.light]}
                      style={styles.actionSheetAvatarPlaceholderPremium}
                    >
                      <Ionicons name="people" size={32} color="#FFFFFF" />
                    </LinearGradient>
                  )}
                  {isModerator() && (
                    <View style={styles.adminBadgeSmall}>
                      <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.actionSheetNameWrapper}>
                  <Text style={[styles.actionSheetGroupNamePremium, { color: colors.text }]}>{group?.name}</Text>
                  <Text style={[styles.actionSheetGroupMetaPremium, { color: colors.secondaryText }]}>
                    {memberCount} members • {group?.isPrivate ? 'Private' : 'Public'}
                  </Text>
                </View>
              </View>

              {/* Quick Actions Grid */}
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickActionItem}
                  onPress={() => handleMuteGroup(notificationSettings.muted ? null : '8 hours')}
                >
                  <View style={[styles.quickActionIconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons
                      name={notificationSettings.muted ? "volume-off" : "volume-high"}
                      size={20}
                      color={notificationSettings.muted ? '#FF3B30' : premiumColors.primary.main}
                    />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: colors.secondaryText }]}>
                    {notificationSettings.muted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionItem} onPress={handleShareGroup}>
                  <View style={[styles.quickActionIconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons name="share-outline" size={20} color={premiumColors.primary.main} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: colors.secondaryText }]}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionItem} onPress={handleCopyInviteCode}>
                  <View style={[styles.quickActionIconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons name="link" size={20} color={premiumColors.primary.main} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: colors.secondaryText }]}>Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionItem}
                  onPress={() => { closeGroupOptions(); openGroupInfo(); }}
                >
                  <View style={[styles.quickActionIconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons name="information-circle-outline" size={20} color={premiumColors.primary.main} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: colors.secondaryText }]}>Info</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.actionSheetContentPremium}>
              {/* Settings Section */}
              <View style={styles.actionSheetSectionPremium}>
                {isModerator() && (
                  <TouchableOpacity style={styles.actionSheetItemPremium} onPress={openEditGroup}>
                    <View style={[styles.actionSheetIconPremium, { backgroundColor: '#3B82F620' }]}>
                      <Ionicons name="settings-outline" size={18} color="#3B82F6" />
                    </View>
                    <Text style={[styles.actionSheetItemTextPremium, { color: colors.text }]}>Group Settings</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionSheetItemPremium}
                  onPress={() => {
                    setShowGroupOptions(false);
                    setTimeout(() => openBackgroundPicker(), 300);
                  }}
                >
                  <View style={[styles.actionSheetIconPremium, { backgroundColor: '#10B98120' }]}>
                    <Ionicons name="image-outline" size={18} color="#10B981" />
                  </View>
                  <Text style={[styles.actionSheetItemTextPremium, { color: colors.text }]}>Chat Wallpaper</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionSheetItemPremium} onPress={() => setShowNotificationSettings(true)}>
                  <View style={[styles.actionSheetIconPremium, { backgroundColor: '#F59E0B20' }]}>
                    <Ionicons name="notifications-outline" size={18} color="#F59E0B" />
                  </View>
                  <Text style={[styles.actionSheetItemTextPremium, { color: colors.text }]}>Notifications</Text>
                  <Text style={[styles.actionSheetItemValuePremium, { color: colors.secondaryText }]}>
                    {notificationSettings.muted ? 'Muted' : 'On'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Danger/Social Section */}
              <View style={[styles.actionSheetSectionPremium, { marginTop: 12 }]}>
                <TouchableOpacity style={styles.actionSheetItemPremium} onPress={handleReportGroup}>
                  <View style={[styles.actionSheetIconPremium, { backgroundColor: '#64748B20' }]}>
                    <Ionicons name="flag-outline" size={18} color="#64748B" />
                  </View>
                  <Text style={[styles.actionSheetItemTextPremium, { color: colors.text }]}>Report Group</Text>
                </TouchableOpacity>

                {isMember() && !isModerator() && (
                  <TouchableOpacity style={styles.actionSheetItemPremium} onPress={handleLeave}>
                    <View style={[styles.actionSheetIconPremium, { backgroundColor: '#EF444420' }]}>
                      <Ionicons name="exit-outline" size={18} color="#EF4444" />
                    </View>
                    <Text style={[styles.actionSheetItemTextPremium, { color: '#EF4444' }]}>Leave Group</Text>
                  </TouchableOpacity>
                )}

                {isModerator() && (
                  <TouchableOpacity style={styles.actionSheetItemPremium} onPress={handleDeleteGroup}>
                    <View style={[styles.actionSheetIconPremium, { backgroundColor: '#EF444420' }]}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </View>
                    <Text style={[styles.actionSheetItemTextPremium, { color: '#EF4444' }]}>Delete Group</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.premiumActionSheetCancel, { backgroundColor: colors.card }]}
            onPress={closeGroupOptions}
            activeOpacity={0.8}
          >
            <Text style={[styles.premiumActionSheetCancelText, { color: premiumColors.primary.main }]}>Close Menu</Text>
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
            <TouchableOpacity onPress={showGroupImageOptions} activeOpacity={0.8}>
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
            <TouchableOpacity style={styles.editGroupPhotoBtn} onPress={showGroupImageOptions}>
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

  // Telegram-style Gradients
  const premiumGradients = [
    ['#ff9a9e', '#fecfef'], ['#a18cd1', '#fbc2eb'], ['#fad0c4', '#ffd1ff'],
    ['#ffecd2', '#fcb69f'], ['#84fab0', '#8fd3f4'], ['#a1c4fd', '#c2e9fb'],
    ['#e0c3fc', '#8ec5fc'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#667eea', '#764ba2'],
    ['#2af598', '#009efd'], ['#6a11cb', '#2575fc'], ['#f77062', '#fe5196'],
    ['#cfd9df', '#e2ebf0'], ['#a8edea', '#fed6e3'], ['#5ee7df', '#b490ca'],
    ['#d299c2', '#fef9d7'], ['#fddb92', '#d1fdff'], ['#9890e3', '#b1f4cf'],
  ];

  // Telegram-style Solid Colors
  const backgroundColors = isDarkMode ? [
    '#0F172A', '#1E293B', '#334155', '#475569', '#1e1e1e', '#212121',
    '#2c3e50', '#000000', '#192a56', '#2f3640', '#353b48', '#222f3e',
    '#57606f', '#747d8c', '#a4b0be', '#2f3542', '#212f3c', '#2c2c54',
  ] : [
    '#F8FAFC', '#F1F5F9', '#E2E8F0', '#dff9fb', '#f7f1e3', '#f1f2f6',
    '#dfe4ea', '#ced6e0', '#a4b0be', '#57606f', '#747d8c', '#2f3542',
    '#ffffff', '#f5f6fa', '#dcdde1', '#718093', '#353b48', '#2f3640',
  ];

  const renderBackgroundPickerModal = () => (
    <Modal
      visible={showBackgroundPicker}
      transparent={false}
      animationType="slide"
      onRequestClose={closeBackgroundPicker}
    >
      <View style={[styles.wallpaperModalContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
        {/* Telegram-style Header */}
        <View style={[styles.wallpaperHeaderTelegram, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={closeBackgroundPicker} style={styles.wallpaperBackBtnTelegram}>
            <Ionicons name="close" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.wallpaperHeaderTitleTelegram, { color: colors.text }]}>Chat Wallpaper</Text>
          <TouchableOpacity onPress={resetBackground} style={styles.wallpaperResetBtnTelegram}>
            <Text style={{ color: premiumColors.primary.main, fontSize: 16, fontWeight: '600' }}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.wallpaperScrollViewTelegram}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Main Preview */}
          <View style={styles.wallpaperPreviewContainerTelegram}>
            <View style={[styles.wallpaperPreviewFrameTelegram, { borderColor: colors.border }]}>
              {/* Dynamic Background */}
              <View style={[
                styles.wallpaperPreviewBox,
                chatBackground?.type === 'color' && { backgroundColor: chatBackground.value },
                !chatBackground && { backgroundColor: isDarkMode ? '#0B141A' : '#E4DDD6' },
              ]}>
                {chatBackground?.type === 'image' && (
                  <Image
                    source={{ uri: chatBackground.value }}
                    style={styles.wallpaperPreviewImage}
                    resizeMode="cover"
                  />
                )}
                {chatBackground?.type === 'gradient' && (
                  <LinearGradient
                    colors={chatBackground.value}
                    style={styles.wallpaperPreviewImage}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}

                {/* Telegram-like Bubbles */}
                <View style={styles.wallpaperPreviewChat}>
                  <View style={[styles.wallpaperBubbleStart, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                    <Text style={[styles.wallpaperText, { color: colors.text }]}>Check out this new wallpaper! 🎨</Text>
                    <Text style={[styles.wallpaperTime, { color: colors.secondaryText }]}>10:41</Text>
                  </View>
                  <View style={[styles.wallpaperBubbleEnd, { backgroundColor: premiumColors.primary.main }]}>
                    <Text style={[styles.wallpaperText, { color: '#ffffff' }]}>Looks amazing! 😍</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 4 }}>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>10:42</Text>
                      <Ionicons name="checkmark-done" size={14} color="#fff" />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Gallery Button */}
          <TouchableOpacity
            style={[styles.wallpaperGalleryBtn, { backgroundColor: colors.card }]}
            onPress={pickBackgroundImage}
          >
            <View style={styles.wallpaperGalleryIcon}>
              <Ionicons name="camera-outline" size={24} color={premiumColors.primary.main} />
            </View>
            <Text style={[styles.wallpaperGalleryText, { color: premiumColors.primary.main }]}>Set from Gallery</Text>
          </TouchableOpacity>

          {/* Gradients Section */}
          <View style={styles.wallpaperSectionTelegram}>
            <Text style={[styles.wallpaperSectionTitleTelegram, { color: colors.secondaryText }]}>MOTION & GRADIENTS</Text>
            <View style={styles.wallpaperGridTelegram}>
              {premiumGradients.map((gradient, index) => (
                <TouchableOpacity
                  key={`grad-${index}`}
                  style={[
                    styles.wallpaperThumbTelegram,
                    chatBackground?.type === 'gradient' && chatBackground.value[0] === gradient[0] && styles.wallpaperThumbActive
                  ]}
                  onPress={() => setChatBackground({ type: 'gradient', value: gradient })}
                >
                  <LinearGradient
                    colors={gradient}
                    style={{ flex: 1, borderRadius: 12 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  {chatBackground?.type === 'gradient' && chatBackground.value[0] === gradient[0] && (
                    <View style={styles.wallpaperCheckOverlay}>
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Colors Section */}
          <View style={styles.wallpaperSectionTelegram}>
            <Text style={[styles.wallpaperSectionTitleTelegram, { color: colors.secondaryText }]}>SOLID COLORS</Text>
            <View style={styles.wallpaperGridTelegram}>
              {backgroundColors.map((color, index) => (
                <TouchableOpacity
                  key={`col-${index}`}
                  style={[
                    styles.wallpaperThumbTelegram,
                    chatBackground?.type === 'color' && chatBackground.value === color && styles.wallpaperThumbActive,
                    { backgroundColor: color }
                  ]}
                  onPress={() => setBackgroundColor(color)}
                >
                  {chatBackground?.type === 'color' && chatBackground.value === color && (
                    <View style={styles.wallpaperCheckOverlay}>
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#0B141A' : '#F0F2F5' }]}>
        {/* Theme-Aware Chat Header */}
        <View style={[
          styles.chatHeader,
          { backgroundColor: isDarkMode ? '#1F2C34' : '#FFFFFF' },
          !isDarkMode && styles.chatHeaderLightShadow,
        ]}>
          <View style={styles.chatHeaderLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.chatHeaderBackBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#E9EDEF' : '#111B21'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatHeaderGroupInfo}
              onPress={openGroupInfo}
              activeOpacity={0.7}
            >
              {group.image ? (
                <Image source={{ uri: group.image }} style={styles.chatHeaderAvatar} />
              ) : (
                <View style={[
                  styles.chatHeaderAvatarPlaceholder,
                  { backgroundColor: isDarkMode ? '#374955' : '#DFE5E7' }
                ]}>
                  <Ionicons name="people" size={20} color={isDarkMode ? '#8696A0' : '#667781'} />
                </View>
              )}
              <View style={styles.chatHeaderTextBox}>
                <Text
                  style={[styles.chatHeaderGroupName, { color: isDarkMode ? '#E9EDEF' : '#111B21' }]}
                  numberOfLines={1}
                >
                  {group.name}
                </Text>
                <Text
                  style={[styles.chatHeaderSubtext, { color: isDarkMode ? '#8696A0' : '#667781' }]}
                  numberOfLines={1}
                >
                  {memberCount} {memberCount === 1 ? 'member' : 'members'} · Tap for info
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.chatHeaderRight}>
            <TouchableOpacity
              style={styles.chatHeaderIconBtn}
              onPress={() => startCall('video')}
              activeOpacity={0.6}
            >
              <Ionicons name="videocam" size={22} color={isDarkMode ? '#E9EDEF' : '#54656F'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatHeaderIconBtn}
              onPress={() => startCall('voice')}
              activeOpacity={0.6}
            >
              <Ionicons name="call" size={21} color={isDarkMode ? '#E9EDEF' : '#54656F'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatHeaderIconBtn}
              onPress={openGroupOptions}
              activeOpacity={0.6}
            >
              <Ionicons name="ellipsis-vertical" size={21} color={isDarkMode ? '#E9EDEF' : '#54656F'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages Area with Custom Background - Wrapped in KeyboardAvoidingView for proper keyboard handling */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={{ flex: 1 }}
        >
          <View style={[
            styles.whatsappChatArea,
            { backgroundColor: isDarkMode ? '#0B141A' : '#E4DDD6' },
            chatBackground?.type === 'color' && { backgroundColor: chatBackground.value },
          ]}>
            {/* Background Image */}
            {chatBackground?.type === 'image' && (
              <Image
                source={{ uri: chatBackground.value }}
                style={styles.chatBackgroundImage}
                resizeMode="cover"
              />
            )}

            {/* Background Gradient */}
            {chatBackground?.type === 'gradient' && (
              <LinearGradient
                colors={chatBackground.value}
                style={styles.chatBackgroundImage}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <ScrollView
              ref={discussionsScrollRef}
              style={styles.chatScrollView}
              contentContainerStyle={styles.whatsappChatContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.primary.main} />
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {/* Access Restriction Check */}
              {!isAuthenticated ? (
                <View style={styles.whatsappEmptyChat}>
                  <View style={[styles.restrictedAccessIcon, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="lock-closed" size={50} color="#EF4444" />
                  </View>
                  <Text style={[styles.whatsappEmptyTitle, { color: isDarkMode ? '#E9EDEF' : '#111B21' }]}>
                    Login Required
                  </Text>
                  <Text style={[styles.whatsappEmptyText, { color: isDarkMode ? '#8696A0' : '#667781', textAlign: 'center', paddingHorizontal: 20 }]}>
                    Please login to view group messages and participate in discussions.
                  </Text>
                  <TouchableOpacity
                    style={[styles.restrictedAccessBtn, { backgroundColor: '#3B82F6' }]}
                    onPress={() => navigation.navigate('Auth')}
                  >
                    <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.restrictedAccessBtnText}>Login to Continue</Text>
                  </TouchableOpacity>
                </View>
              ) : !isMember() ? (
                <View style={styles.whatsappEmptyChat}>
                  <View style={[styles.restrictedAccessIcon, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
                    <Ionicons name="people" size={50} color="#F59E0B" />
                  </View>
                  <Text style={[styles.whatsappEmptyTitle, { color: isDarkMode ? '#E9EDEF' : '#111B21' }]}>
                    Members Only
                  </Text>
                  <Text style={[styles.whatsappEmptyText, { color: isDarkMode ? '#8696A0' : '#667781', textAlign: 'center', paddingHorizontal: 20 }]}>
                    Join this study group to view messages and participate in discussions with other members.
                  </Text>
                  <TouchableOpacity
                    style={[styles.restrictedAccessBtn, { backgroundColor: '#10B981' }]}
                    onPress={handleJoin}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.restrictedAccessBtnText}>
                      {group.isPrivate ? 'Request to Join' : 'Join Group'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : group.discussions?.length > 0 ? (
                group.discussions.map((discussion, index) => (
                  <MessageBubble
                    key={discussion._id || index}
                    discussion={discussion}
                    index={index}
                    user={user}
                    isDarkMode={isDarkMode}
                    colors={colors}
                    messageReactions={messageReactions}
                    isModerator={isModerator()}
                    onSwipeDelete={handleSwipeDelete}
                    onDoubleTapLike={handleDoubleTapLike}
                    onLongPress={openMessageActions}
                    onImagePreview={openImagePreview}
                    onDownloadDocument={downloadDocument}
                    onReply={setReplyingTo}
                    onPlayVoice={playVoiceMessage}
                    playingVoice={playingVoice}
                    voiceProgress={voiceProgress}
                    showReactionPicker={showReactionPicker}
                    reactionPickerAnim={reactionPickerAnim}
                    handleReaction={handleReaction}
                    setShowReactionPicker={setShowReactionPicker}
                    doubleTapHeartIndex={doubleTapHeartIndex}
                    doubleTapHeartAnim={doubleTapHeartAnim}
                    swipeableRefs={swipeableRefs}
                    groupDiscussions={group.discussions}
                  />
                ))
              ) : (
                <View style={styles.whatsappEmptyChat}>
                  <View style={styles.whatsappEmptyIcon}>
                    <Ionicons name="chatbubbles" size={60} color={isDarkMode ? '#8696A0' : '#A0AEB7'} />
                  </View>
                  <Text style={[styles.whatsappEmptyTitle, { color: isDarkMode ? '#E9EDEF' : '#111B21' }]}>
                    No messages yet
                  </Text>
                  <Text style={[styles.whatsappEmptyText, { color: isDarkMode ? '#8696A0' : '#667781' }]}>
                    Say hello and start the conversation!
                  </Text>
                </View>
              )}
            </ScrollView>

            {isMember() ? (
              <>
                {typingUsers.length > 0 && (
                  <View style={styles.typingIndicatorWrapper}>
                    <Text style={[styles.typingIndicatorText, { color: isDarkMode ? '#8696A0' : '#667781' }]}>
                      {typingUsers.length === 1
                        ? `${typingUsers[0]} is typing...`
                        : `${typingUsers.length} people are typing...`}
                    </Text>
                  </View>
                )}
                <ChatInput
                  discussionMessage={discussionMessage}
                  setDiscussionMessage={setDiscussionMessage}
                  replyingTo={replyingTo}
                  cancelReply={cancelReply}
                  selectedImage={selectedImage}
                  selectedDocument={selectedDocument}
                  cancelAttachment={cancelAttachment}
                  isDarkMode={isDarkMode}
                  colors={colors}
                  insets={insets}
                  keyboardVisible={keyboardVisible}
                  showEmojiPicker={showEmojiPicker}
                  setShowEmojiPicker={setShowEmojiPicker}
                  showAttachmentMenu={showAttachmentMenu}
                  setShowAttachmentMenu={setShowAttachmentMenu}
                  handleSendMessage={handleSendMessage}
                  sendingMessage={sendingMessage}
                  isRecording={isRecording}
                  startRecording={startRecording}
                  sendVoiceMessage={sendVoiceMessage}
                  recordingAnimRef={recordingAnimRef}
                />

                {isRecording && (
                  <RecordingOverlay
                    recordingDuration={recordingDuration}
                    cancelRecording={cancelRecording}
                    sendVoiceMessage={sendVoiceMessage}
                    recordingAnimRef={recordingAnimRef}
                  />
                )}

                {showAttachmentMenu && (
                  <AttachmentMenu
                    colors={colors}
                    attachmentMenuAnim={attachmentMenuAnim}
                    pickImage={pickImage}
                    takePhoto={takePhoto}
                    pickDocument={pickDocument}
                    setShowAttachmentMenu={setShowAttachmentMenu}
                    startRecording={startRecording}
                  />
                )}

                {showEmojiPicker && (
                  <EmojiPicker
                    colors={colors}
                    onSelectEmoji={insertEmoji}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </>
            ) : (
              <View style={[
                styles.whatsappJoinPrompt,
                {
                  backgroundColor: isDarkMode ? '#182229' : '#FFFFFF',
                  paddingBottom: Math.max(insets.bottom, 8) + 16,
                }
              ]}>
                <Text style={[styles.whatsappJoinText, { color: isDarkMode ? '#8696A0' : '#667781' }]}>
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
          </View>
        </KeyboardAvoidingView>

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
          <View style={styles.telegramCallContainer}>
            {callType === 'video' ? (
              <>
                {/* Full Screen Camera Background */}
                <LinearGradient
                  colors={['#1A1A2E', '#16213E', '#0F3460']}
                  style={styles.telegramVideoBackground}
                >
                  {!isVideoSwapped ? (
                    cameraPermission?.granted ? (
                      <CameraView
                        style={styles.telegramFullCamera}
                        facing={isFrontCamera ? 'front' : 'back'}
                      />
                    ) : (
                      <View style={styles.telegramNoCameraGradient}>
                        <View style={styles.telegramNoCameraIcon}>
                          <Ionicons name="videocam-off" size={60} color="rgba(255,255,255,0.3)" />
                        </View>
                        <Text style={styles.telegramNoCameraText}>Camera access required</Text>
                      </View>
                    )
                  ) : (
                    isVideoOn && cameraPermission?.granted ? (
                      <CameraView style={styles.telegramFullCamera} facing={isFrontCamera ? 'front' : 'back'} />
                    ) : (
                      <View style={[styles.telegramNoCameraGradient, { backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={60} color="rgba(255,255,255,0.3)" />
                      </View>
                    )
                  )}
                </LinearGradient>

                {/* Floating Self View - Draggable */}
                <TouchableOpacity
                  style={styles.telegramSelfView}
                  onPress={() => setIsVideoSwapped(prev => !prev)}
                  activeOpacity={0.9}
                >
                  {isVideoSwapped ? (
                    cameraPermission?.granted ? (
                      <CameraView style={styles.telegramSelfCamera} facing={isFrontCamera ? 'front' : 'back'} />
                    ) : (
                      <View style={[styles.telegramSelfPlaceholder, { backgroundColor: '#1A1A2E' }]}>
                        <Ionicons name="videocam-off" size={24} color="rgba(255,255,255,0.5)" />
                      </View>
                    )
                  ) : (
                    isVideoOn && cameraPermission?.granted ? (
                      <CameraView style={styles.telegramSelfCamera} facing={isFrontCamera ? 'front' : 'back'} />
                    ) : (
                      <View style={styles.telegramSelfPlaceholder}>
                        <Ionicons name="person" size={32} color="rgba(255,255,255,0.5)" />
                      </View>
                    )
                  )}
                </TouchableOpacity>

                {/* Top Info Bar */}
                <View style={styles.telegramCallTopBar}>
                  <View style={styles.telegramCallInfo}>
                    <Text style={styles.telegramCallGroupName}>{group?.name}</Text>
                    <View style={styles.telegramCallStatusRow}>
                      <View style={styles.telegramCallLiveIndicator} />
                      <Text style={styles.telegramCallDuration}>
                        {callDuration > 0 ? formatCallDuration(callDuration) : 'Connecting...'}
                      </Text>
                      <Text style={styles.telegramCallParticipantCount}>• {memberCount} participants</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Controls - Telegram Style */}
                <View style={styles.telegramCallControls}>
                  <View style={styles.telegramControlsMain}>
                    {/* Flip Camera */}
                    <TouchableOpacity style={styles.telegramControlBtn} onPress={toggleCamera}>
                      <Ionicons name="camera-reverse" size={26} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Mute */}
                    <TouchableOpacity
                      style={[styles.telegramControlBtn, isMuted && styles.telegramControlBtnActive]}
                      onPress={toggleMute}
                    >
                      <Ionicons name={isMuted ? "mic-off" : "mic"} size={26} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* End Call - Red Button */}
                    <TouchableOpacity style={styles.telegramEndCallBtn} onPress={endCall}>
                      <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                    </TouchableOpacity>

                    {/* Video Toggle */}
                    <TouchableOpacity
                      style={[styles.telegramControlBtn, !isVideoOn && styles.telegramControlBtnActive]}
                      onPress={toggleVideo}
                    >
                      <Ionicons name={isVideoOn ? "videocam" : "videocam-off"} size={26} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Speaker */}
                    <TouchableOpacity
                      style={[styles.telegramControlBtn, isSpeakerOn && styles.telegramControlBtnActive]}
                      onPress={toggleSpeaker}
                    >
                      <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={26} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              /* Voice Call - Telegram Style */
              <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={styles.telegramVoiceCallBg}>
                <View style={styles.telegramVoiceCallContent}>
                  <Animated.View style={[styles.telegramVoiceAvatar, { transform: [{ scale: callPulseAnim }] }]}>
                    {group?.image ? (
                      <Image source={{ uri: group.image }} style={styles.telegramVoiceAvatarImage} />
                    ) : (
                      <View style={styles.telegramVoiceAvatarPlaceholder}>
                        <Ionicons name="people" size={50} color="#FFFFFF" />
                      </View>
                    )}
                  </Animated.View>
                  <Text style={styles.telegramVoiceGroupName}>{group?.name}</Text>
                  <Text style={styles.telegramVoiceStatus}>
                    {callDuration > 0 ? formatCallDuration(callDuration) : 'Connecting...'}
                  </Text>
                  <Text style={styles.telegramVoiceParticipants}>{memberCount} participants</Text>
                </View>

                <View style={styles.telegramVoiceControls}>
                  <TouchableOpacity
                    style={styles.telegramVoiceControlBtn}
                    onPress={toggleMute}
                  >
                    <View style={[styles.telegramVoiceBtnCircle, isMuted && styles.telegramVoiceBtnActive]}>
                      <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color={isMuted ? "#000000" : "#FFFFFF"} />
                    </View>
                    <Text style={styles.telegramVoiceControlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.telegramVoiceEndBtn} onPress={endCall}>
                    <Ionicons name="call" size={36} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.telegramVoiceControlBtn}
                    onPress={toggleSpeaker}
                  >
                    <View style={[styles.telegramVoiceBtnCircle, isSpeakerOn && styles.telegramVoiceBtnActive]}>
                      <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={28} color={isSpeakerOn ? "#000000" : "#FFFFFF"} />
                    </View>
                    <Text style={styles.telegramVoiceControlLabel}>Speaker</Text>
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
          <View style={styles.telegramPreviewContainer}>
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={styles.telegramFullScreenImage}
                resizeMode="contain"
              />
            )}

            {/* Telegram Header */}
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={styles.telegramPreviewHeader}
            >
              <TouchableOpacity
                style={styles.telegramHeaderBackBtn}
                onPress={() => setShowImagePreview(false)}
              >
                <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.telegramHeaderInfo}>
                <Text style={styles.telegramHeaderTitle}>Photo</Text>
                <Text style={styles.telegramHeaderSubtitle}>1 of 1</Text>
              </View>
            </LinearGradient>

            {/* Telegram Footer */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.telegramPreviewFooter}
            >
              <TouchableOpacity
                style={styles.telegramFooterIconBtn}
                onPress={() => shareImage(previewImage)}
              >
                <Ionicons name="share-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.telegramFooterIconBtn}
                onPress={() => downloadImage(previewImage)}
              >
                <Ionicons name="download-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>
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

        {renderIncomingCallModal()}
        {renderVoiceCallModal()}
        {renderGroupOptionsModal()}
        {renderEditGroupModal()}
        {renderGroupInfoModal()}
        {renderBackgroundPickerModal()}
      </View >
    </GestureHandlerRootView >
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
  incomingCallOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingCallContent: {
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  incomingCallAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  incomingCallTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  incomingCallName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  incomingCallGroup: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 30,
  },
  incomingCallActions: {
    flexDirection: 'row',
    gap: 40,
  },
  callActionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...premiumShadows.md,
  },
  typingIndicatorWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  typingIndicatorText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  imageBubble: {
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    overflow: 'visible',
  },
  ownMessageBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 6,
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
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    minWidth: width * 0.5,
    maxWidth: width * 0.7,
  },
  attachedImage: {
    width: width * 0.65,
    height: width * 0.85, // More vertical aspect ratio like generic photos
    borderRadius: 16,
  },
  telegramImageTimePill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 40,
    justifyContent: 'center',
  },
  telegramImageTimeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },

  imageMessageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  ownImageBubble: {
    borderRadius: 16,
  },
  otherImageBubble: {
    borderRadius: 16,
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

  // Telegram-style Video Call
  telegramCallContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  telegramVideoBackground: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  telegramFullCamera: {
    flex: 1,
  },
  telegramNoCameraGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramNoCameraIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  telegramNoCameraText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  telegramSelfView: {
    position: 'absolute',
    top: 100,
    right: 16,
    width: 110,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#2C2C2E',
  },
  telegramSelfCamera: {
    flex: 1,
  },
  telegramSelfPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
  },
  telegramCallTopBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 140,
  },
  telegramCallInfo: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  telegramCallGroupName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  telegramCallStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telegramCallLiveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  telegramCallDuration: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  telegramCallParticipantCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginLeft: 4,
  },
  telegramCallControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  telegramControlsMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  telegramControlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramControlBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  telegramEndCallBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  // Telegram Video Call Styles
  telegramCallContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  telegramVideoBackground: {
    flex: 1,
  },
  telegramFullCamera: {
    flex: 1,
  },
  telegramNoCameraGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramNoCameraIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  telegramNoCameraText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  telegramSelfView: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 16,
    width: 120, // Mobile portrait width
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 20, // Ensure it's above other elements
  },
  telegramSelfCamera: {
    flex: 1,
  },
  telegramSelfPlaceholder: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramCallTopBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    zIndex: 10, // Below self view
  },
  telegramCallInfo: {
    flex: 1,
    marginRight: 140, // Space for self view
  },
  telegramCallGroupName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  telegramCallStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telegramCallLiveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
    marginRight: 6,
  },
  telegramCallDuration: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  telegramCallParticipantCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  telegramCallControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  telegramControlsMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  // Telegram Voice Call Styles
  telegramVoiceCallBg: {
    flex: 1,
  },
  telegramVoiceCallContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  telegramVoiceAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  telegramVoiceAvatarImage: {
    width: '100%',
    height: '100%',
  },
  telegramVoiceAvatarPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramVoiceGroupName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 8,
  },
  telegramVoiceStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    marginBottom: 4,
  },
  telegramVoiceParticipants: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
  telegramVoiceControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingBottom: 60,
    gap: 20,
  },
  telegramVoiceControlBtn: {
    alignItems: 'center',
    width: 80,
    marginTop: 10,
  },
  telegramVoiceBtnCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramVoiceBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  telegramVoiceControlLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },
  telegramVoiceEndBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Legacy FaceTime styles (kept for compatibility)
  faceTimeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  faceTimeMain: {
    flex: 1,
  },

  // Telegram Image Preview Styles
  telegramPreviewContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  telegramFullScreenImage: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  telegramPreviewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  telegramHeaderBackBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  telegramHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  telegramHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  telegramHeaderSubtitle: {
    color: '#D1D1D1',
    fontSize: 13,
  },
  telegramPreviewFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    zIndex: 20,
  },
  telegramFooterIconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Premium Redesigned Action Sheet
  premiumActionSheet: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    ...premiumShadows.large,
  },
  actionSheetHeaderPremium: {
    padding: 24,
    paddingBottom: 20,
  },
  actionSheetGroupInfoPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionSheetAvatarWrapper: {
    position: 'relative',
  },
  actionSheetAvatarPremium: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  actionSheetAvatarPlaceholderPremium: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBadgeSmall: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#3B82F6',
    width: 20,
    height: 20,
    borderRadius: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  actionSheetNameWrapper: {
    marginLeft: 16,
    flex: 1,
  },
  actionSheetGroupNamePremium: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  actionSheetGroupMetaPremium: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  quickActionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionSheetContentPremium: {
    padding: 16,
    paddingTop: 8,
  },
  actionSheetSectionPremium: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionSheetItemPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  actionSheetIconPremium: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionSheetItemTextPremium: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  actionSheetItemValuePremium: {
    fontSize: 14,
    marginRight: 4,
  },
  premiumActionSheetCancel: {
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    ...premiumShadows.medium,
  },
  premiumActionSheetCancelText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
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

  // Theme-Aware Chat Header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  chatHeaderLightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  chatHeaderBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginLeft: 4,
  },
  chatHeaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  chatHeaderAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderTextBox: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  chatHeaderGroupName: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  chatHeaderSubtext: {
    fontSize: 13,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  chatHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatHeaderIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // WhatsApp Chat Area
  whatsappChatArea: {
    flex: 1,
    backgroundColor: '#0B141A',
    position: 'relative',
  },
  chatBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  chatScrollView: {
    flex: 1,
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
  restrictedAccessIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  restrictedAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  restrictedAccessBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Telegram-style Input Container
  telegramInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  telegramInputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 44,
    maxHeight: 120,
  },
  telegramEmojiBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramInput: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    paddingVertical: 8,
    paddingHorizontal: 4,
    maxHeight: 100,
    textAlignVertical: 'center',
  },
  telegramAttachBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramMicBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramSendBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Legacy WhatsApp styles (kept for compatibility)
  whatsappInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 6,
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
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
    maxHeight: 120,
  },
  whatsappInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 0,
    paddingTop: 2,
    maxHeight: 100,
    textAlignVertical: 'center',
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
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  whatsappJoinText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  whatsappJoinBtn: {
    backgroundColor: premiumColors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  whatsappJoinBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // WhatsApp Document Styles
  whatsappDocContainer: {
    width: '100%',
    marginBottom: 4,
  },
  whatsappDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    minWidth: 250,
  },
  whatsappDocIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  whatsappDocExtBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0B141A',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  whatsappDocExtText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  whatsappDocInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  whatsappDocName: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 4,
  },
  whatsappDocMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappDocSize: {
    color: '#8696A0',
    fontSize: 12,
  },
  whatsappDocDot: {
    color: '#8696A0',
    fontSize: 12,
    marginHorizontal: 6,
  },
  whatsappDocType: {
    color: '#8696A0',
    fontSize: 12,
  },
  whatsappDocDownload: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(134, 150, 160, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappDocCaption: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 6,
  },

  // Wallpaper Modal Styles - Premium Design
  // Telegram-style Wallpaper Styles
  wallpaperModalContainer: {
    flex: 1,
  },
  wallpaperHeaderTelegram: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  wallpaperBackBtnTelegram: {
    padding: 4,
  },
  wallpaperHeaderTitleTelegram: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  wallpaperResetBtnTelegram: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  wallpaperScrollViewTelegram: {
    flex: 1,
  },
  wallpaperPreviewContainerTelegram: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(128,128,128,0.05)',
    marginBottom: 20,
  },
  wallpaperPreviewFrameTelegram: {
    width: 180,
    height: 320,
    borderRadius: 24,
    borderWidth: 4,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  wallpaperPreviewBox: {
    flex: 1,
  },
  wallpaperPreviewImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  wallpaperBubbleStart: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginBottom: 8,
    maxWidth: '85%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  wallpaperBubbleEnd: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    maxWidth: '85%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  wallpaperText: {
    fontSize: 13,
    lineHeight: 18,
  },
  wallpaperTime: {
    fontSize: 10,
    marginTop: 2,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
  wallpaperGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  wallpaperGalleryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,122,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  wallpaperGalleryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  wallpaperSectionTelegram: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  wallpaperSectionTitleTelegram: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  wallpaperGridTelegram: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wallpaperThumbTelegram: {
    width: (width - 32 - 24) / 4, // 4 columns with gap
    height: ((width - 32 - 24) / 4) * 1.5, // 1.5 aspect ratio
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wallpaperThumbActive: {
    borderColor: premiumColors.primary.main,
    transform: [{ scale: 1.05 }],
  },
  wallpaperCheckOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Professional Image Attachment Preview
  proAttachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 14,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  proAttachmentThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
    marginLeft: 2,
  },
  proAttachmentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  proAttachmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  proAttachmentSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  proAttachmentCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

