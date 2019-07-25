import React, {useState} from 'react';
import {Button, Container, Grid, Icon, List, Placeholder, Segment} from 'semantic-ui-react';
import styles from './CreateNewdle.module.scss';

export default function CreateNewdle() {
  const [step, setStep] = useState(1);
  return (
    <>
      <Button.Group>
        <Button onClick={() => setStep(1)}>1</Button>
        <Button onClick={() => setStep(2)}>2</Button>
        <Button onClick={() => setStep(3)}>3</Button>
      </Button.Group>
      {step === 1 && <ParticipantsPage />}
      {step === 2 && <TimeSlotsPage />}
      {step === 3 && 'step 3'}
    </>
  );
}

function ParticipantsPage() {
  return (
    <>
      <Container text>
        <Segment style={{minHeight: '300px'}}>
          <List>
            <List.Item>
              <List.Content floated="right">
                <Icon name="close" color="red" />
              </List.Content>
              <List.Icon name="user circle" size="large" />
              <List.Content>
                <List.Header as="a">Daniel Louise</List.Header>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Content floated="right">
                <Icon name="close" color="red" />
              </List.Content>
              <List.Icon name="user circle" size="large" />
              <List.Content>
                <List.Header as="a">Stevie Feliciano</List.Header>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Content floated="right">
                <Icon name="close" color="red" />
              </List.Content>
              <List.Icon name="user circle" size="large" />
              <List.Content>
                <List.Header as="a">Elliot Fu</List.Header>
              </List.Content>
            </List.Item>
          </List>
        </Segment>
        <div className={styles.buttonRow}>
          <Button color="violet" icon labelPosition="right" size="small">
            Add participant
            <Icon name="plus" />
          </Button>
        </div>
      </Container>
      <div className={styles.buttonRow}>
        <Button color="violet" icon labelPosition="right">
          Skip
          <Icon name="caret right" />
        </Button>
      </div>
    </>
  );
}

function TimeSlotsPage() {
  return (
    <Grid>
      <Grid.Row columns={2}>
        <Grid.Column width={5}>
          {/* TODO: Replace with calendar */}
          <Placeholder>
            <Placeholder.Image square />
          </Placeholder>
        </Grid.Column>
        <Grid.Column width={11}>
          {/* TODO: Replace with timeline */}
          <Placeholder fluid>
            <Placeholder.Line length="full" />
            <Placeholder.Line length="very long" />
            <Placeholder.Line length="long" />
            <Placeholder.Line length="medium" />
            <Placeholder.Line length="very long" />
            <Placeholder.Line length="long" />
            <Placeholder.Line length="full" />
            <Placeholder.Line length="medium" />
            <Placeholder.Line length="very long" />
            <Placeholder.Line length="long" />
            <Placeholder.Line length="full" />
            <Placeholder.Line length="medium" />
            <Placeholder.Line length="very long" />
            <Placeholder.Line length="full" />
            <Placeholder.Line length="medium" />
            <Placeholder.Line length="long" />
          </Placeholder>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <div className={styles.buttonRow}>
          <Button color="violet" icon labelPosition="right">
            Next step
            <Icon name="caret right" />
          </Button>
        </div>
      </Grid.Row>
    </Grid>
  );
}
