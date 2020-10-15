import React from 'react';
import {Trans} from '@lingui/macro';
import {Grid} from 'semantic-ui-react';
import client from '../client';
import LanguageSelector from './common/LanguageSelector';
import styles from './Footer.module.scss';

export default function Footer() {
  const [configuredLinks] = client.useBackend(() => client.getFooterLinks(), []);

  const links = configuredLinks || [];

  return (
    <footer className={styles.footer}>
      <Grid columns={3}>
        <Grid.Row verticalAlign="middle">
          <Grid.Column computer={4} tablet={4} only="computer tablet">
            <ProjectInfo />
          </Grid.Column>
          <Grid.Column
            {...(links.length === 0 ? {only: 'computer tablet'} : {mobile: 16})}
            tablet={8}
            computer={8}
          >
            <ul className={styles.links}>
              {links.map(([title, href]) => (
                <li key={title}>
                  <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </Grid.Column>
          <Grid.Column mobile={8} only="mobile">
            <ProjectInfo />
          </Grid.Column>
          <Grid.Column mobile={8} tablet={4} computer={4} textAlign="right">
            <LanguageSelector className={styles.language} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </footer>
  );
}

function ProjectInfo() {
  const newdleLink = (
    <a href="https://github.com/indico/newdle" target="_blank" rel="noopener noreferrer">
      newdle
    </a>
  );
  const cernLink = (
    <a href="https://home.cern" target="_blank" rel="noopener noreferrer">
      CERN
    </a>
  );

  return (
    <div className={styles.info}>
      <p className={styles.newdle}>
        <Trans>{newdleLink} is Open Source</Trans>
      </p>
      <p className={styles.cern}>
        <Trans>Made at {cernLink}</Trans>
      </p>
    </div>
  );
}
