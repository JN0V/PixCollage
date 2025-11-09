import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <div className="fixed top-20 right-4 z-50">
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="pl-8 pr-3 py-2 bg-white/95 backdrop-blur border border-gray-300 rounded-lg shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
      <LanguageIcon className="w-4 h-4 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};
