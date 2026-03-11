import { HStack, Select } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import { LANGUAGES, LanguageCode, setLanguage } from '../i18n';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as LanguageCode);
  };

  return (
    <HStack spacing={1} alignItems="center">
      <FiGlobe size={14} color="gray" />
      <Select
        size="xs"
        variant="unstyled"
        value={i18n.language}
        onChange={handleChange}
        w="auto"
        fontSize="sm"
        color="gray.600"
        cursor="pointer"
        _hover={{ color: 'gray.900' }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
