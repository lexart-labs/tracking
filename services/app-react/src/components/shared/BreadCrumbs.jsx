
import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';

export default function BasicDemo() {
    const items = [{ label: 'Users', url: '/users' }, { label: 'User' }];
    const home = { icon: 'pi pi-home', url: 'https://primereact.org' }

    return (
        <BreadCrumb model={items} home={home} />
    )
}