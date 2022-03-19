/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { useGameEditionContext, useLiquidityContext, useModalContext, useSwapContext, useWalletContext } from '../../contexts';
import TxView from '../modals/TxView';
import WalletRequestView from '../modals/WalletRequestView';
import CustomButton from '../shared/CustomButton';
import FormContainer from '../shared/FormContainer';
import Input from '../shared/Input';
import tokenData from '../../constants/cryptoCurrencies';
import GradientBorder from '../shared/GradientBorder';
import Label from '../shared/Label';
import PressButtonToActionLabel from '../game-edition-v2/components/PressButtonToActionLabel';
import { InfoContainer } from '../game-edition-v2/components/PixeledInfoContainerBlue';
import { PRECISION } from '../../constants/contextConstants';
import { extractDecimal, limitDecimalPlaces, pairUnit, reduceBalance } from '../../utils/reduceBalance';
import { LIQUIDITY_VIEW } from '../../constants/liquidityView';
import PixeledBlueContainer from '../game-edition-v2/components/PixeledInfoContainerBlue';
import LogoLoader from '../shared/Loader';
import { FadeIn } from '../shared/animations';
import { FlexContainer } from '../shared/FlexContainer';
import InputRange from '../shared/InputRange';
import { SuccessRemoveView } from '../modals/liquidity/LiquidityTxView';

const Container = styled(FadeIn)`
  margin-top: 0px;

  overflow: auto;
  max-width: 550px;
  .ui.input > input {
    padding: 0px;
    padding-bottom: 16px;
    font-size: 13px;
    height: fit-content;
  }
`;
const SubContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  width: 100%;
  padding: ${({ gameEditionView }) => gameEditionView && '0 16px'};
  & > *:first-child {
    margin-bottom: 16px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  & > button:not(:last-child) {
    margin-right: 8px;
  }
  & > button:last-child {
    margin-right: 0px;
  }
  @media (max-width: ${({ theme: { mediaQueries } }) => `${mediaQueries.mobilePixel}px`}) {
    & > button {
      padding: 0px !important;
    }
  }
`;

const RemoveLiquidityContent = ({ pair }) => {
  const swap = useSwapContext();
  const wallet = useWalletContext();
  const liquidity = useLiquidityContext();
  const modalContext = useModalContext();
  const { gameEditionView, openModal, closeModal, setButtons } = useGameEditionContext();

  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);

  const [pooled, setPooled] = useState(pair?.balance);
  const [pooledToken0, setPooledToken0] = useState(reduceBalance(pair?.pooledAmount?.[0], 12));

  const [pooledToken1, setPooledToken1] = useState(reduceBalance(pair?.pooledAmount?.[1], 12));

  useEffect(() => {
    if (!isNaN(amount) && pair) {
      setPooled(reduceBalance((extractDecimal(pair?.balance) * amount) / 100, PRECISION));
      setPooledToken0(reduceBalance((extractDecimal(pair?.pooledAmount[0]) * amount) / 100, PRECISION));
      setPooledToken1(reduceBalance((extractDecimal(pair?.pooledAmount[1]) * amount) / 100, PRECISION));
    }
  }, [amount, pair]);

  useEffect(() => {
    if (!isNaN(amount) && reduceBalance(amount) !== 0) {
      setButtons({
        A: () => {
          onRemoveLiquidity();
        },
      });
    } else {
      setButtons({ A: null });
    }
  }, [amount, pooled, pooledToken0, pooledToken1]);

  useEffect(() => {
    if (wallet.walletSuccess) {
      //?//
      setLoading(false);
      wallet.setWalletSuccess(false);
    }
  }, [wallet.walletSuccess]);

  const sendTransaction = () => {
    setLoading(true);
    swap.swapSend();
    // onClose();
    setLoading(false);
  };

  const onWalletRequestViewModalClose = () => {
    wallet.setIsWaitingForWalletAuth(false);
    wallet.setWalletError(null);
  };

  const openTxViewModal = () => {
    if (gameEditionView) {
      openModal({
        titleFontSize: 32,
        containerStyle: { padding: 0 },
        titleContainerStyle: {
          padding: 16,
          paddingBottom: 0,
        },
        title: 'transaction details',
        onClose: () => {
          closeModal();
        },
        content: (
          <TxView
            view={LIQUIDITY_VIEW.REMOVE_LIQUIDITY}
            token0={pair?.token0}
            onClose={() => {
              closeModal();
            }}
            token1={pair?.token1}
          />
        ),
      });
    } else {
      modalContext.openModal({
        title: 'remove liquidity?',
        description: '',
        onClose: () => {
          modalContext.closeModal();
        },
        content: (
          <TxView
            onClose={() => {
              modalContext.closeModal();
            }}
            loading={loading}
          >
            <SuccessRemoveView
              token0={pair.token0}
              token1={pair.token1}
              swap={swap}
              label="Remove Liquidity"
              loading={loading}
              onClick={sendTransaction}
            />
          </TxView>
        ),
      });
    }
  };

  const onRemoveLiquidity = async () => {
    if (wallet.signing.method !== 'sign' && wallet.signing.method !== 'none') {
      setLoading(true);
      const res = await liquidity.removeLiquidityLocal(tokenData[pair?.token0].code, tokenData[pair?.token1].code, reduceBalance(pooled, PRECISION));
      if (res === -1) {
        setLoading(false);
        alert('Incorrect password. If forgotten, you can reset it with your private key');
        return;
      } else {
        openTxViewModal();
        setLoading(false);
      }
    } else {
      setLoading(true);
      const res = await liquidity.removeLiquidityWallet(tokenData[pair?.token0].code, tokenData[pair?.token1].code, reduceBalance(pooled, PRECISION));
      if (!res) {
        wallet.setIsWaitingForWalletAuth(true);
        setLoading(false);
        /* pact.setWalletError(true); */
        /* walletError(); */
      } else {
        wallet.setWalletError(null);
        openTxViewModal();
        setLoading(false);
      }
    }
  };

  return (
    <Container $gameEditionView={gameEditionView}>
      <WalletRequestView show={wallet.isWaitingForWalletAuth} error={wallet.walletError} onClose={() => onWalletRequestViewModalClose()} />

      <FormContainer
        containerStyle={gameEditionView ? { border: 'none', padding: 0 } : {}}
        footer={
          <ButtonContainer gameEditionView={gameEditionView}>
            {gameEditionView ? (
              loading ? (
                <LogoLoader />
              ) : (
                <PressButtonToActionLabel actionLabel="remove liquidity" />
              )
            ) : (
              <CustomButton
                fluid
                type="gradient"
                loading={loading}
                disabled={isNaN(amount) || reduceBalance(amount) === 0}
                onClick={async () => await onRemoveLiquidity()}
              >
                Remove
              </CustomButton>
            )}
          </ButtonContainer>
        }
      >
        {!gameEditionView && <GradientBorder />}
        <SubContainer gameEditionView={gameEditionView}>
          <Input
            value={amount}
            error={isNaN(amount)}
            placeholder="Enter Amount"
            geColor="white"
            withBorder
            numberOnly
            inputStyle={{ fontSize: 13, padding: 0 }}
            topComponent={
              <Label fontSize={13} labelStyle={{ marginBottom: 16 }}>
                Amount
              </Label>
            }
            inputRightComponent={
              <FlexContainer className="align-ce h-fit-content">
                <CustomButton
                  buttonStyle={{
                    padding: 0,
                    height: 'fit-content',
                  }}
                  fontFamily="basier"
                  labelStyle={{ textTransform: 'uppercase' }}
                  type="basic"
                  fontSize={13}
                  onClick={() => setAmount(100)}
                >
                  Max
                </CustomButton>
                <Label labelStyle={{ marginLeft: 4 }} fontSize={13}>
                  %
                </Label>
              </FlexContainer>
            }
            onChange={(e) => {
              if (Number(e.target.value) <= 100 && Number(e.target.value) >= 0) {
                setAmount(limitDecimalPlaces(e.target.value, 2));
              }
            }}
          />

          <InputRange value={amount} setValue={setAmount} />
        </SubContainer>

        {gameEditionView ? (
          <InfoContainer style={{ marginTop: 32 }}>
            <PixeledBlueContainer label={`${pair?.token0}/${pair?.token1}`} value={extractDecimal(pooled).toPrecision(4)} />
            <PixeledBlueContainer label={`Pooled ${pair?.token0}`} value={extractDecimal(pooledToken0).toPrecision(4)} />
            <PixeledBlueContainer label={`Pooled ${pair?.token1}`} value={extractDecimal(pooledToken1).toPrecision(4)} />
          </InfoContainer>
        ) : (
          <FlexContainer className="column" gap={12} style={{ margin: '16px 0' }}>
            <FlexContainer className="justify-sb w-100">
              <Label fontSize={13}>Pooled {pair?.token0}</Label>
              <Label fontSize={13}>{pairUnit(extractDecimal(pooledToken0))}</Label>
            </FlexContainer>
            <FlexContainer className="justify-sb w-100">
              <Label fontSize={13}>Pooled {pair?.token1}</Label>
              <Label fontSize={13}>{pairUnit(extractDecimal(pooledToken1))}</Label>
            </FlexContainer>
            <FlexContainer className="justify-sb w-100">
              <Label fontSize={13}>
                {pair?.token0}/{pair?.token1} Rate
              </Label>
              <Label fontSize={13}>{pairUnit(extractDecimal(pooled))}</Label>
            </FlexContainer>
          </FlexContainer>
        )}
      </FormContainer>
    </Container>
  );
};

export default RemoveLiquidityContent;