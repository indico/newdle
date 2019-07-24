import React, {useState} from 'react';
import {Grid, Header} from 'semantic-ui-react';
import {Route, Switch, Link} from 'react-router-dom';
import Navigator from './Navigator';
import UserMenu from './UserMenu';
import styles from './TopHeader.module.scss';

const steps = [
  {
    title: 'Choose the Participants',
    description: 'You can also "Skip" this step and add them later',
  },
  {
    title: 'Choose the Timeslots',
    description: 'Which will be presented as options to the participants',
  },
  {
    title: 'Finalize',
    description: 'Do something final here',
  },
];

export default function TopHeader() {
  const [active] = useState(1);
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
              <Route exact path="/new" render={() => <Navigator steps={steps} active={active} />} />
            </Switch>
          </Grid.Column>
          <Grid.Column />
        </Grid.Row>
      </Grid>
    </header>
  );
}
