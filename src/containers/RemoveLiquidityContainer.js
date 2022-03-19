/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import { useAccountContext } from '../contexts';
import RemoveLiquidityContent from '../components/liquidity/RemoveLiquidityContent';
import SlippagePopupContent from '../components/layout/header/SlippagePopupContent';
import { FadeIn } from '../components/shared/animations';
import { FlexContainer } from '../components/shared/FlexContainer';
import { ArrowBack } from '../assets';
import Label from '../components/shared/Label';
import RewardBooster from '../components/liquidity/RewardBooster';
import { ROUTE_LIQUIDITY_MY_LIQUIDITY } from '../router/routes';
import { getPairListAccountBalance } from '../api/pact-pair';
import useQueryParams from '../hooks/useQueryParams';
import AppLoader from '../components/shared/AppLoader';
import { LIQUIDITY_VIEW } from '../constants/liquidityView';

const Container = styled(FadeIn)`
  margin-top: 0px;
  margin-left: auto;
  margin-right: auto;
  overflow: auto;
  max-width: 550px;
  overflow: visible;

  .arrow-back {
    path {
      fill: ${({ theme: { colors } }) => colors.white};
    }
  }
`;

const RemoveLiquidityContainer = () => {
  const history = useHistory();
  const query = useQueryParams();

  const { account } = useAccountContext();

  const [loading, setLoading] = useState(false);
  const [pair, setPair] = useState(null);

  const fetchData = async () => {
    const token0 = query.get('token0');
    const token1 = query.get('token1');
    const resultPairList = await getPairListAccountBalance(account.account);
    const currentPair = resultPairList.find((p) => p.token0 === token0 && p.token1 === token1);
    setPair(currentPair);

    setLoading(false);
  };

  useEffect(() => {
    if (account.account) {
      setLoading(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, [account]);

  return loading ? (
    <AppLoader className="h-100 w-100 justify-ce align-ce" />
  ) : (
    <Container className="column w-100 relative justify-ce h-100" gap={24}>
      {!pair ? (
        <Label>no pair</Label>
      ) : (
        <>
          <FlexContainer className="w-100 justify-sb">
            <FlexContainer>
              <ArrowBack
                className="arrow-back"
                style={{
                  cursor: 'pointer',

                  marginRight: '15px',
                  justifyContent: 'center',
                }}
                onClick={() => {
                  history.push(ROUTE_LIQUIDITY_MY_LIQUIDITY);
                }}
              />
              <Label fontSize={24} fontFamily="syncopate">
                REMOVE LIQUIDITY
              </Label>
            </FlexContainer>
            <SlippagePopupContent />
          </FlexContainer>
          <RewardBooster type={LIQUIDITY_VIEW.REMOVE_LIQUIDITY} />
          <RemoveLiquidityContent pair={pair} />
        </>
      )}
    </Container>
  );
};

export default RemoveLiquidityContainer;