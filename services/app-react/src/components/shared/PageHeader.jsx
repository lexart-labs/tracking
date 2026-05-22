import React from 'react'
import { Button } from 'primereact/button'

/**
 * PageHeader Component
 * A unified, responsive page header component styled to match the Tasks module.
 * 
 * @param {string} title The main page title.
 * @param {string} [description] Optional subtitle or description.
 * @param {string} [buttonLabel] Optional text for the primary action button.
 * @param {string} [buttonIcon="pi pi-plus"] Optional icon for the primary action button.
 * @param {function} [onButtonClick] Optional callback function when the primary action button is clicked.
 * @param {React.ReactNode} [children] Optional custom actions or content to place on the right side of the header.
 */
export default function PageHeader({ title, description, buttonLabel, buttonIcon = 'pi pi-plus', onButtonClick, children }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                {description && <p className="text-gray-500 text-sm mt-1 font-medium">{description}</p>}
            </div>
            {(buttonLabel || children) && (
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {children}
                    {buttonLabel && (
                        <Button 
                            label={buttonLabel} 
                            icon={buttonIcon} 
                            className="p-button-primary rounded-xl px-8 h-[46px] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                            onClick={onButtonClick}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
