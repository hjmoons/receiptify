import { useState, useEffect, useRef } from 'react';

export const useKebabMenu = () => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 케밥 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 케밥 메뉴 토글
  const toggleKebabMenu = (categoryId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === categoryId ? null : categoryId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  return {
    openMenuId,
    menuRef,
    toggleKebabMenu,
    closeMenu
  };
};