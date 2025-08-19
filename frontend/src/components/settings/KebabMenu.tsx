import React from 'react';
import type { Category } from '../../types/category';

interface KebabMenuProps {
  category: Category;
  isChild?: boolean;
  isOpen: boolean;
  menuRef?: React.RefObject<HTMLDivElement | null>;
  onToggle: (categoryId: number, event: React.MouseEvent) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const KebabMenu: React.FC<KebabMenuProps> = ({
  category,
  isChild = false,
  isOpen,
  menuRef,
  onToggle,
  onEdit,
  onDelete
}) => {
  return (
    <div className="relative" ref={isOpen ? menuRef : null}>
      <button
        onClick={(e) => onToggle(category.id, e)}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="옵션"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className={`absolute ${isChild ? 'right-0' : 'right-0'} top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-28`}>
          <button
            onClick={() => onEdit(category)}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 rounded-t-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>수정</span>
          </button>
          <button
            onClick={() => onDelete(category)}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-b-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>삭제</span>
          </button>
        </div>
      )}
    </div>
  );
};