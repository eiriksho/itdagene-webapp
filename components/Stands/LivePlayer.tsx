import React from 'react';
import styled from 'styled-components';

const LiveContainer = styled.div<{ frontPage?: boolean }>`
  display: flex;
  max-width: 2000px;
  margin: auto;

  @media only screen and (max-width: 993px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

const Player = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  width: 70%;
  background-color: #222;
  color: white;
  text-align: center;
  vertical-align: middle;
  position: relative;
  margin-bottom: 50px;
  @media only screen and (max-width: 993px) {
    width: 100%;
    height: 400px;
  }
  @media only screen and (max-width: 767px) {
    height: 250px;
  }
`;

const QAView = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  width: 30%;
  background-color: #222;
  color: white;
  @media only screen and (max-width: 993px) {
    width: 100%;
    height: 400px;
  }
`;

interface Props {
  livestreamUrl: string;
  qaUrl: string;
  frontPage?: boolean;
}
const LivePlayer = ({
  livestreamUrl,
  qaUrl,
  frontPage,
}: Props): JSX.Element => (
  <LiveContainer frontPage={frontPage ?? false}>
    <Player>
      {livestreamUrl ? (
        <iframe
          title="livestreamEmbed"
          src={`${livestreamUrl}?autoplay=true`}
          style={{ position: 'absolute', top: '0', left: '0' }}
          allowFullScreen
          frameBorder="no"
          width="100%"
          height="100%"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      ) : (
        <h3>Ingen stream for øyeblikket</h3>
      )}
    </Player>
    <QAView>
      {qaUrl ? (
        <iframe
          title="slidoEmbed"
          src={qaUrl}
          height="100%"
          width="100%"
          frameBorder="0"
        ></iframe>
      ) : (
        <h3>Ingen Q&A for øyeblikket</h3>
      )}
    </QAView>
  </LiveContainer>
);

export default LivePlayer;
