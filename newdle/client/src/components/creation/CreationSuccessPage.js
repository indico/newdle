import React from 'react';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {Redirect} from 'react-router-dom';
import {Trans, t} from '@lingui/macro';
import {Button, Container, Header, Input, Popup} from 'semantic-ui-react';
import {getCreatedNewdle} from '../../selectors';
import {usePageTitle} from '../../util/hooks';
import styles from './CreationSuccessPage.module.scss';

export default function CreationSuccessPage() {
  const newdle = useSelector(getCreatedNewdle);
  const history = useHistory();
  usePageTitle('newdle created');

  if (!newdle) {
    return <Redirect to="/new" />;
  }

  const handleSummaryClick = () => {
    history.push(`/newdle/${newdle.code}/summary`);
  };

  return (
    <Container text>
      <Header as="h1" className={styles['newdle-title']}>
        {newdle.title}
      </Header>
      <div className={styles['success-message']}>
        <Header as="h3" className={styles['header']}>
          <Trans>Done!</Trans>
        </Header>
        {newdle.participants.length !== 0 ? (
          <p>
            <Trans>
              Your newdle was created and invitation e-mails have been sent. You can send the
              following link to everyone you would like to invite:
            </Trans>
          </p>
        ) : (
          <p>
            <Trans>
              Your newdle was created. You can now send the following to everyone you would like to
              invite:
            </Trans>
          </p>
        )}
        <Input
          className={styles['newdle-link']}
          fluid
          readOnly
          value={newdle.url}
          onFocus={evt => {
            evt.target.select();
          }}
          action={
            navigator.clipboard && (
              <Popup
                content={t`Copied!`}
                on="click"
                position="top center"
                inverted
                trigger={
                  <Button
                    icon="copy"
                    title={t`Copy to clipboard`}
                    onClick={() => navigator.clipboard.writeText(newdle.url)}
                  />
                }
              />
            )
          }
        />
      </div>
      <div className={styles['summary-button']}>
        <Button color="teal" onClick={handleSummaryClick}>
          <Trans>Go to newdle summary!</Trans>
        </Button>
      </div>
    </Container>
  );
}
