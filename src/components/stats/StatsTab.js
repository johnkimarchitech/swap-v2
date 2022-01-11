/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from 'react';
import { Divider } from 'semantic-ui-react';
import styled from 'styled-components/macro';
import { GameEditionContext } from '../../contexts/GameEditionContext';
import { LightModeContext } from '../../contexts/LightModeContext';
import { PactContext } from '../../contexts/PactContext';
import useWindowSize from '../../hooks/useWindowSize';
import GradientBorder from '../../components/shared/GradientBorder';
import LogoLoader from '../../components/shared/LogoLoader';
import ModalContainer from '../../components/shared/ModalContainer';
import { theme } from '../../styles/theme';
import { PartialScrollableScrollSection, Title, TitleContainer } from '../layout/Containers';
import StatsCard from './StatsCard';

export const CardContainer = styled.div`
  position: ${({ gameEditionView }) => !gameEditionView && `relative`};
  display: flex;
  flex-flow: column;
  align-items: center;
  padding: ${({ gameEditionView }) => (gameEditionView ? `24px` : `32px `)};
  width: 100%;
  max-width: 1110px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 10px;

  opacity: 1;
  background: ${({ gameEditionView, theme: { backgroundContainer } }) => (gameEditionView ? `transparent` : backgroundContainer)}; // or add new style
  backdrop-filter: ${({ gameEditionView }) => !gameEditionView && `blur(50px)`};
  border: ${({ gameEditionView, theme: { colors } }) => gameEditionView && `2px dashed ${colors.black}`};

  @media (max-width: ${({ theme: { mediaQueries } }) => `${mediaQueries.mobilePixel + 1}px`}) {
    padding: ${({ gameEditionView }) => gameEditionView && `12px`};
    flex-flow: column;
    gap: 0px;
  }
`;

const Tabs = styled(Title)`
  opacity: ${({ active }) => (active ? '1' : '0.4')};
  cursor: pointer;
  @media (max-width: ${({ theme: { mediaQueries } }) => `${mediaQueries.mobileSmallPixel + 1}px`}) {
    font-size: 24px;
  }
`;

const StatsTab = ({ activeTabs, setActiveTabs }) => {
  const pact = useContext(PactContext);
  const { gameEditionView } = useContext(GameEditionContext);
  const { themeMode } = useContext(LightModeContext);

  useEffect(async () => {
    await pact.getPairList();
  }, []);

  const [width] = useWindowSize();

  return (
    <ModalContainer
      withoutRainbowBackground
      backgroundNotChangebleWithTheme
      containerStyle={{
        maxHeight: !gameEditionView && '80vh',
        padding: gameEditionView ? (width <= theme().mediaQueries.mobilePixel ? '16px 8px' : '16px 24px') : 0,
        border: gameEditionView && '1px solid transparent',
        height: gameEditionView && '100%',
      }}
    >
      <TitleContainer
        $gameEditionView={gameEditionView}
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: '1110px',
          justifyContent: 'space-between',
        }}
      >
        <Tabs $gameEditionView={gameEditionView} active={activeTabs === 'POOL_STATS'}>
          Stats
        </Tabs>
        <Tabs $gameEditionView={gameEditionView} active={activeTabs === 'HISTORY'} onClick={setActiveTabs}>
          History
        </Tabs>
      </TitleContainer>
      <CardContainer gameEditionView={gameEditionView}>
        {!gameEditionView && <GradientBorder />}
        <PartialScrollableScrollSection style={{ width: '100%' }} className="scrollbar-none">
          {pact.pairList[0] ? (
            Object.values(pact.pairList).map((pair, index) =>
              pair && pair.reserves ? (
                <div key={index}>
                  <StatsCard pair={pair} key={index} />
                  {Object.values(pact.pairList).length - 1 !== index && (
                    <Divider
                      style={{
                        width: '100%',
                        margin: '32px 0px',
                        borderTop: gameEditionView ? `2px dashed ${theme(themeMode).colors.black}` : `1px solid  ${theme(themeMode).colors.white}`,
                      }}
                    />
                  )}
                </div>
              ) : (
                ''
              )
            )
          ) : (
            <LogoLoader />
          )}
        </PartialScrollableScrollSection>
      </CardContainer>
    </ModalContainer>
  );
};

export default StatsTab;
