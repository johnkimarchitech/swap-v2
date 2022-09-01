import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { AddLiquidityLogo, BoosterIcon, LiquidityDollarLogo } from '../assets';
import LiquidityMyLiquidityTable from '../components/liquidity/LiquidityMyLiquidityTable';
import LiquidityPoolsTable from '../components/liquidity/LiquidityPoolsTable';
import LiquidityRewardsTable from '../components/liquidity/LiquidityRewardsTable';
import LiquidityTablesInfo from '../components/liquidity/LiquidityTablesInfo';
import LiquidityTokensTable from '../components/liquidity/LiquidityTokensTable';
import CustomButton from '../components/shared/CustomButton';
import { FlexContainer } from '../components/shared/FlexContainer';
import InfoPopup from '../components/shared/InfoPopup';
import Label from '../components/shared/Label';
import { useApplicationContext } from '../contexts';
import useWindowSize from '../hooks/useWindowSize';
import {
  ROUTE_LIQUIDITY_ADD_LIQUIDITY_DOUBLE_SIDED,
  ROUTE_LIQUIDITY_ADD_LIQUIDITY_SINGLE_SIDED,
  ROUTE_LIQUIDITY_CREATE_PAIR,
  ROUTE_LIQUIDITY_MY_LIQUIDITY,
  ROUTE_LIQUIDITY_POOLS,
  ROUTE_LIQUIDITY_REWARDS,
  ROUTE_LIQUIDITY_TOKENS,
} from '../router/routes';
import { theme, commonColors } from '../styles/theme';

const LiquidityContainer = () => {
  const { pathname } = useLocation();
  const history = useHistory();
  const { themeMode } = useApplicationContext();
  const [width] = useWindowSize();

  return (
    <FlexContainer
      className="column w-100 h-100 main"
      desktopStyle={{ paddingRight: theme().layout.desktopPadding, paddingLeft: theme().layout.desktopPadding }}
      tabletStyle={{ paddingRight: theme().layout.tabletPadding, paddingLeft: theme().layout.tabletPadding }}
      mobileStyle={{ paddingRight: theme().layout.mobilePadding, paddingLeft: theme().layout.mobilePadding }}
    >
      <FlexContainer className="w-100 justify-sb" mobileClassName="column" tabletClassName="column" style={{ marginBottom: 24 }}>
        <FlexContainer className="align-ce" gap={16} mobileStyle={{ marginBottom: 16 }} tabletStyle={{ marginBottom: 16 }}>
          <Label
            withShade={pathname !== ROUTE_LIQUIDITY_TOKENS}
            className="pointer"
            fontSize={24}
            fontFamily="syncopate"
            onClick={() => history.push(ROUTE_LIQUIDITY_TOKENS)}
          >
            TOKENS
          </Label>
          <Label
            withShade={pathname !== ROUTE_LIQUIDITY_POOLS}
            className="pointer"
            fontSize={24}
            fontFamily="syncopate"
            onClick={() => history.push(ROUTE_LIQUIDITY_POOLS)}
          >
            POOLS
          </Label>
          {(pathname === ROUTE_LIQUIDITY_TOKENS || pathname === ROUTE_LIQUIDITY_POOLS) && (
            <InfoPopup type="modal" title="Liquidity" containerStyle={{ marginLeft: 0 }}>
              <LiquidityTablesInfo pathname={pathname} />
            </InfoPopup>
          )}
        </FlexContainer>
        {width <= theme().mediaQueries.mobilePixel ? (
          /* MOBILE */

          <FlexContainer className="justify-sb" gap={16} mobilePixel={530}>
            <FlexContainer gap={16}>
              <MobileButton
                background={pathname === ROUTE_LIQUIDITY_REWARDS ? commonColors.pink : 'transparent'}
                color={commonColors.pink}
                onClick={() => history.push(ROUTE_LIQUIDITY_REWARDS)}
              >
                <BoosterIcon className={pathname === ROUTE_LIQUIDITY_REWARDS && 'svg-app-color'} />
              </MobileButton>
              <MobileButton
                background={pathname === ROUTE_LIQUIDITY_MY_LIQUIDITY ? theme(themeMode).colors.white : 'transparent'}
                color={theme(themeMode).colors.white}
                onClick={() => history.push(ROUTE_LIQUIDITY_MY_LIQUIDITY)}
              >
                <LiquidityDollarLogo className={pathname === ROUTE_LIQUIDITY_MY_LIQUIDITY ? 'svg-app-inverted-color' : 'svg-app-color'} />
              </MobileButton>
              <MobileButton
                color={theme(themeMode).colors.white}
                onClick={() =>
                  history.push(
                    pathname === ROUTE_LIQUIDITY_TOKENS ? ROUTE_LIQUIDITY_ADD_LIQUIDITY_SINGLE_SIDED : ROUTE_LIQUIDITY_ADD_LIQUIDITY_DOUBLE_SIDED,
                    { from: pathname }
                  )
                }
              >
                <AddLiquidityLogo />
              </MobileButton>
            </FlexContainer>
            {pathname === ROUTE_LIQUIDITY_POOLS && (
              <CustomButton
                fontSize={13}
                buttonStyle={{ height: 33, padding: 0, width: 'min-content', padding: '0px 16px' }}
                type="gradient"
                fontFamily="syncopate"
                onClick={() => history.push(ROUTE_LIQUIDITY_CREATE_PAIR)}
              >
                CREATE PAIR
              </CustomButton>
            )}
          </FlexContainer>
        ) : (
          /* DESKTOP & TABLET */

          <FlexContainer gap={16} mobilePixel={530}>
            <CustomButton
              fontSize={13}
              buttonStyle={{ height: 33 }}
              type={pathname === ROUTE_LIQUIDITY_REWARDS ? 'secondary' : 'primary'}
              color={commonColors.pink}
              onClick={() => history.push(ROUTE_LIQUIDITY_REWARDS)}
            >
              <ButtonContent color={pathname === ROUTE_LIQUIDITY_REWARDS ? '#fff' : commonColors.pink}>
                <BoosterIcon />
                <Label fontFamily="syncopate" color={pathname === ROUTE_LIQUIDITY_REWARDS ? '#fff' : commonColors.pink} labelStyle={{ marginTop: 1 }}>
                  REWARDS
                </Label>
              </ButtonContent>
            </CustomButton>
            <CustomButton
              fontSize={13}
              buttonStyle={{ height: 33 }}
              type={pathname === ROUTE_LIQUIDITY_MY_LIQUIDITY ? 'secondary' : 'primary'}
              fontFamily="syncopate"
              onClick={() => history.push(ROUTE_LIQUIDITY_MY_LIQUIDITY)}
            >
              <ButtonContent color={commonColors.white}>
                <LiquidityDollarLogo className={pathname === ROUTE_LIQUIDITY_MY_LIQUIDITY ? 'svg-app-inverted-color' : 'svg-app-color'} />
                <Label
                  fontFamily="syncopate"
                  color={pathname === ROUTE_LIQUIDITY_MY_LIQUIDITY ? theme(themeMode).colors.primary : theme(themeMode).colors.white}
                  labelStyle={{ marginTop: 1 }}
                >
                  MY LIQUIDITY
                </Label>
              </ButtonContent>
            </CustomButton>

            {/* <CustomButton
              fontSize={13}
              buttonStyle={{ height: 33 }}
              type="gradient"
              fontFamily="syncopate"
              onClick={() =>
                history.push(
                  pathname === ROUTE_LIQUIDITY_TOKENS ? ROUTE_LIQUIDITY_ADD_LIQUIDITY_SINGLE_SIDED : ROUTE_LIQUIDITY_ADD_LIQUIDITY_DOUBLE_SIDED,
                  { from: pathname }
                )
              }
            >
              ADD LIQUIDITY
            </CustomButton> */}

            {pathname === ROUTE_LIQUIDITY_POOLS && (
              <CustomButton
                fontSize={13}
                buttonStyle={{ height: 33 }}
                type="gradient"
                fontFamily="syncopate"
                onClick={() => history.push(ROUTE_LIQUIDITY_CREATE_PAIR)}
              >
                CREATE PAIR
              </CustomButton>
            )}
          </FlexContainer>
        )}
      </FlexContainer>
      {/* SINGLE SIDE TABLE */}
      {pathname === ROUTE_LIQUIDITY_TOKENS && <LiquidityTokensTable />}
      {/* DOUBLE SIDE TABLE */}
      {pathname === ROUTE_LIQUIDITY_POOLS && <LiquidityPoolsTable />}
      {/* MY LIQUIDITY TABLE */}
      {pathname === ROUTE_LIQUIDITY_MY_LIQUIDITY && <LiquidityMyLiquidityTable />}
      {/* MY LIQUIDITY TABLE */}
      {pathname === ROUTE_LIQUIDITY_REWARDS && <LiquidityRewardsTable />}
    </FlexContainer>
  );
};

export default LiquidityContainer;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  svg {
    margin-right: 8px;
    path {
      fill: ${({ color }) => color};
    }
  }
`;

const MobileButton = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border: ${({ color }) => `2px solid ${color}`};
  background-color: ${({ background }) => background};
  border-radius: 50%;
  height: 33px;
  min-width: 33px;
  svg {
    width: 13px !important;
    height: 13px !important;
    path {
      fill: ${({ color }) => color};
    }
  }
`;
