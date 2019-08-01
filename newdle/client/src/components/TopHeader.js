import React from 'react';
import {Grid, Header} from 'semantic-ui-react';
import {Route, Switch, Link} from 'react-router-dom';
import Navigator from './Navigator';
import UserMenu from './UserMenu';
import styles from './TopHeader.module.scss';

export default function TopHeader() {
  return (
    <header className={styles.header}>
      <Grid columns={3}>
        <Grid.Column>
          <Header as="h1" className={styles.title}>
            <Link to="/">newdle</Link>
          </Header>
        </Grid.Column>
        <Grid.Column />
        <Grid.Column textAlign="right">
          <UserMenu />
        </Grid.Column>
        <Grid.Row centered>
          <Grid.Column />
          <Grid.Column>
            <Switch>
              <Route exact path="/new" render={() => <Navigator />} />
            </Switch>
          </Grid.Column>
          <Grid.Column />
        </Grid.Row>
      </Grid>
    </header>
  );
}
