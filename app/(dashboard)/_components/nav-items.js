import {
  BookOpen,
  File,
  Mail,
  Search,
  Shield,
  Sparkles,
  Upload,
} from 'lucide-react'

export const MENU_LIST = [
  { id: 'upload', name: 'Upload', icon: Upload, path: '/upload' },
  { id: 'files', name: 'Files', icon: File, path: '/files' },
  { id: 'upgrade', name: 'Upgrade', icon: Shield, path: '/upgrade' },
  // { id: 'shares', name: 'Shares', icon: Mail, path: '/mail' },
  { id: 'find', name: 'Find', icon: Search, path: '/search' },
  // { id: 'book', name: 'Book', icon: BookOpen, path: '/books' },
  // { id: 'generative', name: 'Generative', icon: Sparkles, path: '/genrate-AI' },
]