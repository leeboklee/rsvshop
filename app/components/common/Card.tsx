import Link from 'next/link';
import { ReactNode } from 'react';

interface CardProps {
  href?: string;
  title?: string;
  description?: string;
  linkText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  children?: ReactNode;
  className?: string;
}

export default function Card({ 
  href, 
  title, 
  description, 
  linkText, 
  icon,
  variant = 'default',
  children,
  className = ''
}: CardProps) {
  const variantClasses = {
    default: 'border border-gray-200 bg-white shadow-sm hover:shadow-md',
    elevated: 'border-0 bg-white shadow-lg hover:shadow-xl',
    outlined: 'border-2 border-gray-300 bg-white shadow-none hover:shadow-sm'
  };

  const cardContent = (
    <div className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${href ? 'transform hover:-translate-y-1' : ''} ${variantClasses[variant]} ${className}`}>
      {children ? (
        children
      ) : href ? (
        <Link href={href} className="block p-8 h-full" aria-label={`${title} ${description}`}>
          <div className="flex items-start space-x-4">
            {icon && (
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 flex items-center justify-center shadow-lg">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {description}
              </p>
              <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors duration-200">
                {linkText}
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/30 group-hover:to-blue-50/10 transition-all duration-300 pointer-events-none" />
        </Link>
      ) : (
        <div className="p-8 h-full">
          <div className="flex items-start space-x-4">
            {icon && (
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 flex items-center justify-center shadow-lg">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {description}
                </p>
              )}
              {linkText && (
                <div className="flex items-center text-blue-600 font-medium text-sm">
                  {linkText}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return cardContent;
} 