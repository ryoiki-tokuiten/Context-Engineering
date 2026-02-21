
import React from 'react';
import {
  Plus,
  FilePenLine,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Copy,
  Search,
  Check,
  Wand2,
  Bot,
  Archive,
  FileSearch,
  Upload,
  Download,
  ClipboardList,
  Loader2,
  Info,
  AlertTriangle,
  AlertCircle,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  XCircle,
  Settings,
  Clock,
  Undo2,
  Paperclip,
  X,
  LayoutGrid,
  Zap,
  Save,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  BookText,
  ListChecks,
  FileJson,
  Smile,
  Ruler,
  Footprints,
  Languages,
  Quote,
  Ban,
  HelpCircle,
  Globe,
  Shield,
  Code2,
  AlignLeft,
  Feather,
  Binary,
  BrainCircuit,
  GitCompareArrows,
  History,
  MessageSquare,
  Wrench,
  Database,
  FunctionSquare,
  Box,
  Server,
  CheckCircle,
  Terminal,
  TerminalSquare,
  type LucideProps
} from 'lucide-react';

export const PlusIcon: React.FC<LucideProps> = (props) => <Plus {...props} />;
export const EditIcon: React.FC<LucideProps> = (props) => <FilePenLine {...props} />;
export const DeleteIcon: React.FC<LucideProps> = (props) => <Trash2 {...props} />;
export const EyeIcon: React.FC<LucideProps> = (props) => <Eye {...props} />;
export const ChevronDownIcon: React.FC<LucideProps> = (props) => <ChevronDown {...props} />;
export const ChevronUpIcon: React.FC<LucideProps> = (props) => <ChevronUp {...props} />;
export const CopyIcon: React.FC<LucideProps> = (props) => <Copy {...props} />;
export const SearchIcon: React.FC<LucideProps> = (props) => <Search {...props} />;
export const CheckIcon: React.FC<LucideProps> = (props) => <Check {...props} />;
export const SparklesIcon: React.FC<LucideProps> = (props) => <Wand2 {...props} />;
export const ExportIcon: React.FC<LucideProps> = (props) => <Upload {...props} />;
export const ImportIcon: React.FC<LucideProps> = (props) => <Download {...props} />;
export const ClipboardDocumentListIcon: React.FC<LucideProps> = (props) => <ClipboardList {...props} />;

export const SpinnerIcon: React.FC<LucideProps> = ({ className, ...props }) => (
  <Loader2 className={`animate-spin ${className || ''}`} {...props} />
);

export const LightbulbIcon: React.FC<LucideProps> = (props) => <Bot {...props} />;
export const BotIcon: React.FC<LucideProps> = (props) => <Bot {...props} />; // Exported for direct use
export const InfoIcon: React.FC<LucideProps> = (props) => <Info {...props} />;
export const WarningIcon: React.FC<LucideProps> = (props) => <AlertTriangle {...props} />;
export const ErrorIcon: React.FC<LucideProps> = (props) => <AlertCircle {...props} />;
export const FilterIcon: React.FC<LucideProps> = (props) => <Filter {...props} />;
export const SortAscendingIcon: React.FC<LucideProps> = (props) => <SortAsc {...props} />;
export const SortDescendingIcon: React.FC<LucideProps> = (props) => <SortDesc {...props} />;
export const SwitchVerticalIcon: React.FC<LucideProps> = (props) => <ArrowUpDown {...props} />;
export const XCircleIcon: React.FC<LucideProps> = (props) => <XCircle {...props} />;
export const CogIcon: React.FC<LucideProps> = (props) => <Settings {...props} />;
export const ClockIcon: React.FC<LucideProps> = (props) => <Clock {...props} />;
export const ArrowUturnLeftIcon: React.FC<LucideProps> = (props) => <Undo2 {...props} />;
export const PaperClipIcon: React.FC<LucideProps> = (props) => <Paperclip {...props} />;
export const XIcon: React.FC<LucideProps> = (props) => <X {...props} />;
export const ArchiveIcon: React.FC<LucideProps> = (props) => <Archive {...props} />;
export const FileSearchIcon: React.FC<LucideProps> = (props) => <FileSearch {...props} />;
export const BlocksIcon: React.FC<LucideProps> = (props) => <LayoutGrid {...props} />;
export const ZapIcon: React.FC<LucideProps> = (props) => <Zap {...props} />;
export const SaveIcon: React.FC<LucideProps> = (props) => <Save {...props} />;
export const PanelLeftCloseIcon: React.FC<LucideProps> = (props) => <PanelLeftClose {...props} />;
export const PanelLeftOpenIcon: React.FC<LucideProps> = (props) => <PanelLeftOpen {...props} />;
export const GitCompareArrowsIcon: React.FC<LucideProps> = (props) => <GitCompareArrows {...props} />;


// Icons for the Builder
export const UserIcon: React.FC<LucideProps> = (props) => <User {...props} />;
export const BookTextIcon: React.FC<LucideProps> = (props) => <BookText {...props} />;
export const ListChecksIcon: React.FC<LucideProps> = (props) => <ListChecks {...props} />;
export const FileJsonIcon: React.FC<LucideProps> = (props) => <FileJson {...props} />;
export const SmileIcon: React.FC<LucideProps> = (props) => <Smile {...props} />;
export const RulerIcon: React.FC<LucideProps> = (props) => <Ruler {...props} />;
export const FootprintsIcon: React.FC<LucideProps> = (props) => <Footprints {...props} />;
export const LanguagesIcon: React.FC<LucideProps> = (props) => <Languages {...props} />;
export const QuoteIcon: React.FC<LucideProps> = (props) => <Quote {...props} />;
export const BanIcon: React.FC<LucideProps> = (props) => <Ban {...props} />;
export const HelpCircleIcon: React.FC<LucideProps> = (props) => <HelpCircle {...props} />;
export const GlobeIcon: React.FC<LucideProps> = (props) => <Globe {...props} />;
export const ShieldIcon: React.FC<LucideProps> = (props) => <Shield {...props} />;
export const Code2Icon: React.FC<LucideProps> = (props) => <Code2 {...props} />;
export const AlignLeftIcon: React.FC<LucideProps> = (props) => <AlignLeft {...props} />;
export const FeatherIcon: React.FC<LucideProps> = (props) => <Feather {...props} />;
export const BinaryIcon: React.FC<LucideProps> = (props) => <Binary {...props} />;
export const BrainCircuitIcon: React.FC<LucideProps> = (props) => <BrainCircuit {...props} />;
export const BoxIcon: React.FC<LucideProps> = (props) => <Box {...props} />; 

// Context Engineering specific icons
export const HistoryIcon: React.FC<LucideProps> = (props) => <History {...props} />;
export const MessageSquareIcon: React.FC<LucideProps> = (props) => <MessageSquare {...props} />;
export const WrenchIcon: React.FC<LucideProps> = (props) => <Wrench {...props} />;
export const DatabaseIcon: React.FC<LucideProps> = (props) => <Database {...props} />;
export const FunctionSquareIcon: React.FC<LucideProps> = (props) => <FunctionSquare {...props} />;
export const ServerIcon: React.FC<LucideProps> = (props) => <Server {...props} />;
export const CheckCircleIcon: React.FC<LucideProps> = (props) => <CheckCircle {...props} />;
export const TerminalIcon: React.FC<LucideProps> = (props) => <Terminal {...props} />;
export const TerminalSquareIcon: React.FC<LucideProps> = (props) => <TerminalSquare {...props} />;
