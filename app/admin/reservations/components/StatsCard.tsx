"use client";

import React, { memo } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  color: string;
}

const StatsCard = memo(({ title, value, color }: StatsCardProps) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
));

StatsCard.displayName = 'StatsCard';

export default StatsCard;
