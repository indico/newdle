import React from 'react';
import {Grid, Header, Image} from 'semantic-ui-react';
import {Route, Switch, Link} from 'react-router-dom';
import {CreationHeader} from './creation';
import {HomeHeader} from './home';
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
              <Route exact path="/" component={HomeHeader} />
              <Route exact path="/new" component={CreationHeader} />
            </Switch>
          </Grid.Column>
          <Grid.Column tablet={1} computer={8} />
        </Grid.Row>
      </Grid>
    </header>
  );
}
