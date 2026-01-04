import React, {useEffect, useState} from 'react';
import {ipcRenderer} from 'electron';
import {productName, version} from '../../package.json';

import logo from '../icon/OpenBlockDesktop.svg';
import styles from './about.css';

const AboutElement = () => {
    const [resourceVersion, setResourceVersion] = useState('...');

    useEffect(() => {
        ipcRenderer.invoke('get-resource-version').then(ver => {
            setResourceVersion(ver);
        });
    }, []);

    return (
        <div className={styles.aboutBox}>
            <div><img
                alt={`${productName} icon`}
                src={logo}
                className={styles.aboutLogo}
            /></div>
            <div className={styles.aboutText}>
                <h2 className={styles.aboutTitle}>{productName}</h2>
                <table className={styles.aboutDetails}><tbody>
                    <tr><td>Version</td><td>{version}</td></tr>
                    <tr><td>Resources</td><td>{resourceVersion}</td></tr>
                    {
                        ['Electron', 'Chrome', 'Node'].map(component => {
                            const componentVersion = process.versions[component.toLowerCase()];
                            return <tr key={component}><td>{component}</td><td>{componentVersion}</td></tr>;
                        })
                    }
                </tbody></table>
            </div>
        </div>
    );
};

export default <AboutElement />;
