import React from 'react';
import {Grid, Header, Image} from 'semantic-ui-react';
import {Route, Switch, Link} from 'react-router-dom';
import Navigator from './Navigator';
import UserMenu from './UserMenu';
import logo from '../images/logo.svg';
import styles from './TopHeader.module.scss';

export default function TopHeader() {
  return (
    <header className={styles.header}>
      <Grid columns={3}>
        <Grid.Row verticalAlign="middle">
          <Grid.Column>
            <Header as="h1" className={styles.title}>
              <Link to="/">
                <Image src={logo} alt="Newdle logo" />
              </Link>
            </Header>
          </Grid.Column>
          <Grid.Column />
          <Grid.Column textAlign="right">
            <UserMenu />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column tablet={1} computer={4} />
          <Grid.Column tablet={14} computer={8}>
            <Switch>
              <Route exact path="/new" render={() => <Navigator />} />
            </Switch>
          </Grid.Column>
          <Grid.Column tablet={1} computer={8} />
        </Grid.Row>
      </Grid>
    </header>
  );
}
