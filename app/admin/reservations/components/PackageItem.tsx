"use client";

import React, { memo } from 'react';
import { Package } from '@prisma/client';

interface PackageItemProps {
  pkg: Package;
  isSelected: boolean;
  onToggle: () => void;
}

const PackageItem = memo(({ pkg, isSelected, onToggle }: PackageItemProps) => (
  <div className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
    <input
      type="checkbox"
      id={`pkg-${pkg.id}`}
      checked={isSelected}
      onChange={onToggle}
      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <label htmlFor={`pkg-${pkg.id}`} className="ml-4 flex-1 cursor-pointer">
      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
        {pkg.name}
      </div>
      <div className="text-lg font-bold text-blue-600">
        {pkg.price.toLocaleString()}원
      </div>
    </label>
  </div>
));

PackageItem.displayName = 'PackageItem';

export default PackageItem;
