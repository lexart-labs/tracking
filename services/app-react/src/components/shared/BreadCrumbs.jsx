import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';

export default function BreadCrumbs({ items = [] }) {
    const home = { icon: 'pi pi-home', url: '/' }

    return (
        <BreadCrumb model={items} home={home} className="mb-4" />
    )
}
