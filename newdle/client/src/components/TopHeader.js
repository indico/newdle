import React from 'react';
import {Route, Routes, Link} from 'react-router-dom';
import {t} from '@lingui/macro';
import {Grid, Header, Image} from 'semantic-ui-react';
import logo from '../images/logo.svg';
import {AnswerHeader} from './answer';
import {CreationHeader} from './creation';
import {HomeHeader} from './home';
import {SummaryHeader} from './summary';
import UserMenu from './UserMenu';
import styles from './TopHeader.module.scss';

export default function TopHeader() {
  return (
    <header className={styles.header}>
      <Grid columns={2}>
        <Grid.Row verticalAlign="middle">
          <Grid.Column>
            <Header as="h1" className={styles.title}>
              <Link to="/">
                <Image src={logo} alt={t`newdle logo`} />
              </Link>
            </Header>
          </Grid.Column>
          <Grid.Column textAlign="right">
            <UserMenu />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column tablet={1} computer={4} />
          <Grid.Column mobile={16} tablet={14} computer={8}>
            <Routes>
              <Route exact path="/" element={<HomeHeader />} />
              <Route exact path="/new" element={<CreationHeader />} />
              <Route path="/newdle/:code/edit/*" element={<SummaryHeader />} />
              <Route exact path="/newdle/:code/summary" element={<SummaryHeader />} />
              <Route exact path="/newdle/:code" element={<AnswerHeader />} />
              <Route exact path="/newdle/:code/:partcode" element={<AnswerHeader />} />
              {/* avoid warning on pages where we do not have a top header */}
              <Route path="*" element={null} />
            </Routes>
          </Grid.Column>
          <Grid.Column tablet={1} computer={8} />
        </Grid.Row>
      </Grid>
    </header>
  );
}
