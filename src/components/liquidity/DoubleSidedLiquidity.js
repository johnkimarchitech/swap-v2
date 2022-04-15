/* eslint-disable react-hooks/exhaustive-deps */
import { throttle, debounce } from 'throttle-debounce';
import React, { useContext, useEffect, useState } from 'react';
import tokenData from '../../constants/cryptoCurrencies';
import { AccountContext } from '../../contexts/AccountContext';
import { GameEditionContext } from '../../contexts/GameEditionContext';
import { LiquidityContext } from '../../contexts/LiquidityContext';
import { ModalContext } from '../../contexts/ModalContext';
import { PactContext } from '../../contexts/PactContext';
import { WalletContext } from '../../contexts/WalletContext';
import { getCorrectBalance, reduceBalance } from '../../utils/reduceBalance';
import PixeledBlueContainer, { InfoContainer } from '../game-edition-v2/components/PixeledInfoContainerBlue';
import PressButtonToActionLabel from '../game-edition-v2/components/PressButtonToActionLabel';
import TokenSelectorModalContent from '../modals/swap-modals/TokenSelectorModalContent';
import TxView from '../modals/TxView';
import CustomButton from '../shared/CustomButton';
import { FlexContainer } from '../shared/FlexContainer';
import FormContainer from '../shared/FormContainer';
import GradientBorder from '../shared/GradientBorder';
import Label from '../shared/Label';
import SwapForm from '../swap/SwapForm';
import TokenSelectorModalContentGE from '../../components/modals/swap-modals/TokenSelectorModalContentGE';
import WalletRequestView from '../../components/modals/WalletRequestView';
import { LIQUIDITY_VIEW } from '../../constants/liquidityView';
import { SuccessAddView } from '../modals/liquidity/LiquidityTxView';
import { useSwapContext } from '../../contexts';

const initialStateValue = {
  coin: '',
  account: '',
  guard: null,
  balance: null,
  amount: '',
  precision: 0,
};

const DoubleSidedLiquidity = ({ pair, onPairChange }) => {
  const pact = useContext(PactContext);
  const swap = useSwapContext();
  const account = useContext(AccountContext);
  const wallet = useContext(WalletContext);
  const liquidity = useContext(LiquidityContext);
  const modalContext = useContext(ModalContext);
  const { gameEditionView, openModal, closeModal, outsideToken, showTokens, setShowTokens, setOutsideToken } = useContext(GameEditionContext);
  const [tokenSelectorType, setTokenSelectorType] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [inputSide, setInputSide] = useState('');
  const [loading, setLoading] = useState(false);

  const [fromValues, setFromValues] = useState(initialStateValue);

  const [toValues, setToValues] = useState(initialStateValue);

  const [pairExist, setPairExist] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const initData = async () => {
    if (pair.token0 && pair.token1) {
      await handleTokenValue('from', tokenData[pair.token0]);

      await handleTokenValue('to', tokenData[pair.token1]);
    } else {
      await handleTokenValue('from', tokenData['KDX']);

      await handleTokenValue('to', tokenData['KDA']);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    if (showTxModal === false) {
      setFromValues({
        coin: 'KDX',
        account: '',
        guard: null,
        balance: account.account.balance,
        amount: '',
        precision: 12,
      });
      setToValues(initialStateValue);
    }
  }, [showTxModal]);

  /////// when pass pair by the container, set the token on InputToken
  const handleTokenValue = async (by, crypto) => {
    let balance;
    if (crypto?.code === 'coin') {
      if (account.account) {
        balance = account.account.balance;
      }
    } else {
      let acct = await account.getTokenAccount(crypto?.code, account.account.account, tokenSelectorType === 'from');
      if (acct) {
        balance = getCorrectBalance(acct.balance);
      }
    }
    if (by === 'from')
      return setFromValues((prev) => ({
        ...prev,
        balance: balance,
        coin: crypto?.name,
        precision: crypto?.precision,
      }));
    if (by === 'to')
      return setToValues((prev) => ({
        ...prev,
        balance: balance,
        coin: crypto?.name,
        precision: crypto?.precision,
      }));
    else return null;
  };

  useEffect(() => {
    setInputSide('from');
    if (pair?.token0 && fromValues === initialStateValue) {
      handleTokenValue('from', tokenData[pair?.token0]);
    }
  }, [pair?.token0]);

  useEffect(() => {
    setInputSide('to');
    if (pair?.token1 && toValues === initialStateValue) {
      handleTokenValue('to', tokenData[pair?.token1]);
    }
  }, [pair?.token1]);
  ////////

  useEffect(async () => {
    if (tokenSelectorType === 'from') setSelectedToken(fromValues?.coin);
    if (tokenSelectorType === 'to') setSelectedToken(toValues?.coin);
    else setSelectedToken(null);
  }, [tokenSelectorType]);

  useEffect(async () => {
    if (fromValues?.coin !== '') {
      await account.getTokenAccount(tokenData?.[fromValues?.coin]?.code, account.account.account, true);
    }
    if (toValues?.coin !== '') {
      await account.getTokenAccount(tokenData?.[toValues?.coin]?.code, account.account.account, false);
    }
    if (fromValues?.coin !== '' && toValues?.coin !== '') {
      await pact.getPair(tokenData?.[fromValues?.coin]?.code, tokenData?.[toValues?.coin]?.code);
      await pact.getReserves(tokenData?.[fromValues?.coin]?.code, tokenData?.[toValues?.coin]?.code);
      if (pact.pair) {
        setPairExist(true);
      }
    }
  }, [fromValues, toValues, pairExist, account.account.account]);

  const onTokenClick = async ({ crypto }) => {
    let balance;
    if (crypto?.code === 'coin') {
      if (account.account) {
        balance = account.account.balance;
      }
    } else {
      let acct = await account.getTokenAccount(crypto?.code, account.account.account, tokenSelectorType === 'from');
      if (acct) {
        balance = getCorrectBalance(acct.balance);
      }
    }
    if (tokenSelectorType === 'from')
      setFromValues((prev) => ({
        ...prev,
        balance: balance,
        coin: crypto?.name,
        precision: crypto?.precision,
      }));
    if (tokenSelectorType === 'to')
      setToValues((prev) => ({
        ...prev,
        balance: balance,
        coin: crypto?.name,
        precision: crypto?.precision,
      }));
  };

  const onSelectToken = async (crypto) => {
    if (gameEditionView && showTokens) {
      await setOutsideToken((prev) => ({ ...prev, token: crypto }));
      await setShowTokens(false);
    }
    if (tokenSelectorType === 'from' && fromValues.coin === crypto.name) return;
    if (tokenSelectorType === 'to' && toValues.coin === crypto.name) return;
    if ((tokenSelectorType === 'from' && fromValues.coin !== crypto.name) || (tokenSelectorType === 'to' && toValues.coin !== crypto.name)) {
      onTokenClick({ crypto });
    }
  };

  useEffect(() => {
    onPairChange(fromValues.coin, toValues.coin);
  }, [fromValues.coin, toValues.coin]);

  const onWalletRequestViewModalClose = () => {
    wallet.setIsWaitingForWalletAuth(false);
    wallet.setWalletError(null);
  };

  useEffect(() => {
    if (inputSide === 'from' && fromValues.amount !== '') {
      setInputSide(null);
      if (fromValues.coin !== '' && toValues.coin !== '' && !isNaN(pact.ratio)) {
        if (fromValues.amount.length < 5) {
          throttle(
            500,
            setToValues({
              ...toValues,
              amount: reduceBalance(fromValues.amount / pact.ratio, toValues.precision),
            })
          );
        } else {
          debounce(
            500,
            setToValues({
              ...toValues,
              amount: reduceBalance(fromValues.amount / pact.ratio, toValues.precision)?.toFixed(toValues.precision),
            })
          );
        }
      }
    }
    if (isNaN(pact.ratio) || fromValues.amount === '') {
      setToValues((prev) => ({ ...prev, amount: '' }));
    }
  }, [fromValues.amount]);

  useEffect(() => {
    if (inputSide === 'to' && toValues.amount !== '') {
      setInputSide(null);
      if (fromValues.coin !== '' && toValues.coin !== '' && !isNaN(pact.ratio)) {
        if (toValues.amount.length < 5) {
          throttle(
            500,
            setFromValues({
              ...fromValues,
              amount: reduceBalance(toValues.amount * pact.ratio, fromValues.precision),
            })
          );
        } else {
          debounce(
            500,
            setFromValues({
              ...fromValues,
              amount: reduceBalance(toValues.amount * pact.ratio, fromValues.precision)?.toFixed(fromValues?.precision),
            })
          );
        }
      }
    }
    if (isNaN(pact.ratio) || toValues.amount === '') {
      setFromValues((prev) => ({ ...prev, amount: '' }));
    }
  }, [toValues.amount]);

  useEffect(() => {
    if (!isNaN(pact.ratio)) {
      if (fromValues.amount !== '' && toValues.amount === '') {
        setToValues({
          ...toValues,
          amount: reduceBalance(pact.computeOut(fromValues.amount), toValues.precision),
        });
      }
      if (fromValues.amount === '' && toValues.amount !== '') {
        setFromValues({
          ...fromValues,
          amount: reduceBalance(pact.computeIn(toValues.amount), fromValues.precision),
        });
      }
      if (fromValues.amount !== '' && toValues.amount !== '') {
        setToValues({
          ...toValues,
          amount: reduceBalance(pact.computeOut(fromValues.amount), toValues.precision),
        });
      }
    }
  }, [pact.ratio]);

  const buttonStatus = () => {
    let status = {
      0: { msg: 'Connect your KDA wallet', status: false },
      1: { msg: 'Enter Amount', status: false },
      2: { msg: 'Supply', status: true },
      3: {
        msg: (token) => `Insufficient ${token} Balance`,
        status: false,
      },
      4: { msg: 'Pair does not exist yet', status: false },
      5: { msg: 'Pair Already Exists', status: false },
      6: { msg: 'Select different tokens', status: false },
    };
    if (!account.account.account) return status[0];
    if (isNaN(pact.ratio)) {
      return status[4];
    } else if (!fromValues.amount || !toValues.amount) return status[1];
    else if (Number(fromValues.amount) > Number(fromValues.balance)) return { ...status[3], msg: status[3].msg(fromValues.coin) };
    else if (Number(toValues.amount) > Number(toValues.balance)) return { ...status[3], msg: status[3].msg(toValues.coin) };
    else if (fromValues.coin === toValues.coin) return status[6];
    else {
      if (isNaN(pact.ratio)) {
        return status[4];
      } else return status[2];
    }
  };

  const supply = async () => {
    if (wallet.signing.method !== 'sign' && wallet.signing.method !== 'none') {
      const res = await liquidity.addLiquidityLocal(tokenData[fromValues.coin], tokenData[toValues.coin], fromValues.amount, toValues.amount);
      if (res === -1) {
        alert('Incorrect password. If forgotten, you can reset it with your private key');
        return;
      } else {
        setShowTxModal(true);
      }
    } else {
      const res = await liquidity.addLiquidityWallet(tokenData[fromValues.coin], tokenData[toValues.coin], fromValues.amount, toValues.amount);
      if (!res) {
        wallet.setIsWaitingForWalletAuth(true);
        /* pact.setWalletError(true); */
        /* walletError(); */
      } else {
        wallet.setWalletError(null);
        setShowTxModal(true);
      }
    }
  };

  const swapValues = () => {
    const from = { ...fromValues };
    const to = { ...toValues };
    setFromValues({ ...to });
    setToValues({ ...from });
  };

  useEffect(() => {
    if (tokenSelectorType === 'from') {
      if (fromValues.coin === toValues.coin) {
        setToValues({
          amount: '',
          balance: '',
          coin: '',
          address: '',
          precision: 0,
        });
      }
    }
    if (tokenSelectorType === 'to') {
      if (toValues.coin === fromValues.coin) {
        setFromValues({
          amount: '',
          balance: '',
          coin: '',
          address: '',
          precision: 0,
        });
      }
    }
    setTokenSelectorType(null);
  }, [toValues, fromValues]);

  // to handle token for game edition from token list
  useEffect(() => {
    if (outsideToken?.token && gameEditionView) {
      if (outsideToken?.tokenSelectorType === 'from' && fromValues.coin === outsideToken?.token.name) return;
      if (outsideToken?.tokenSelectorType === 'to' && toValues?.coin === outsideToken?.token.name) return;
      if (
        (outsideToken.tokenSelectorType === 'from' && fromValues.coin !== outsideToken?.token.name) ||
        (outsideToken.tokenSelectorType === 'to' && toValues?.coin !== outsideToken?.token.name)
      ) {
        onTokenClick({ crypto: outsideToken?.token });
        closeModal();
      }
    }
  }, [outsideToken, gameEditionView]);

  useEffect(() => {
    if (tokenSelectorType !== null) {
      handleTokenSelectorType();
    }
  }, [tokenSelectorType]);

  const handleTokenSelectorType = () => {
    if (gameEditionView) {
      openModal({
        titleFontSize: 32,
        title: 'Select',
        type: 'arcade-dark',
        onClose: () => {
          setTokenSelectorType(null);
          closeModal();
        },
        content: (
          <FlexContainer className="column w-100 h-100 justify-ce align-ce text-ce">
            <TokenSelectorModalContentGE
              selectedToken={selectedToken}
              tokenSelectorType={tokenSelectorType}
              onTokenClick={onTokenClick}
              onClose={() => {
                closeModal();
              }}
              fromToken={fromValues.coin}
              toToken={toValues.coin}
            />
          </FlexContainer>
        ),
      });
    } else {
      modalContext.openModal({
        title: 'Select',
        description: '',

        onClose: () => {
          setTokenSelectorType(null);
          modalContext.closeModal();
        },
        content: (
          <TokenSelectorModalContent
            selectedToken={selectedToken}
            token={tokenSelectorType === 'from' ? fromValues.coin : toValues.coin}
            onSelectToken={onSelectToken}
            onClose={() => {
              modalContext.closeModal();
            }}
          />
        ),
      });
    }
  };

  const onAddLiquidity = async () => {
    setLoading(true);

    swap.swapSend();

    setLoading(false);
    modalContext.closeModal();
    setShowTxModal(false);
  };

  useEffect(() => {
    if (showTxModal) {
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
            setShowTxModal(false);
            closeModal();
          },
          content: (
            <TxView
              onClose={() => {
                setShowTxModal(false);
                closeModal();
              }}
              view={LIQUIDITY_VIEW.ADD_LIQUIDITY}
              token0={fromValues.coin}
              token1={toValues.coin}
              createTokenPair={() =>
                liquidity.createTokenPairLocal(tokenData[fromValues.coin].name, tokenData[toValues.coin].name, fromValues.amount, toValues.amount)
              }
            />
          ),
        });
      } else {
        modalContext.openModal({
          title: 'transaction details',
          description: '',

          onClose: () => {
            setShowTxModal(false);
            modalContext.closeModal();
          },
          content: (
            <TxView
              onClose={() => {
                setShowTxModal(false);
                modalContext.closeModal();
              }}

              // createTokenPair={() =>
              //   liquidity.createTokenPairLocal(tokenData[fromValues.coin].name, tokenData[toValues.coin].name, fromValues.amount, toValues.amount)
              // }
            >
              <SuccessAddView token0={pair.token0} token1={pair.token1} label="Add Liquidity" loading={loading} onClick={onAddLiquidity} />
            </TxView>
          ),
        });
      }
    }
  }, [showTxModal]);

  return (
    <>
      <WalletRequestView show={wallet.isWaitingForWalletAuth} error={wallet.walletError} onClose={() => onWalletRequestViewModalClose()} />

      <FormContainer
        style={{ justifyContent: 'space-between' }}
        gameEditionView={gameEditionView}
        footer={
          gameEditionView ? (
            <FlexContainer className="justify-ce w-100" style={{ zIndex: 1 }}>
              {buttonStatus().status === true ? (
                <PressButtonToActionLabel actionLabel="add liquidity" />
              ) : (
                <Label geCenter geColor="yellow" geFontSize={20}>
                  {buttonStatus().msg}
                </Label>
              )}
            </FlexContainer>
          ) : (
            <FlexContainer className="justify-ce w-100" style={{ marginTop: 16 }}>
              <CustomButton fluid type="gradient" disabled={!buttonStatus().status} onClick={() => supply()}>
                {buttonStatus().msg}
              </CustomButton>
            </FlexContainer>
          )
        }
      >
        {!gameEditionView && <GradientBorder />}
        <SwapForm
          fromValues={fromValues}
          setFromValues={setFromValues}
          toValues={toValues}
          setToValues={setToValues}
          setTokenSelectorType={setTokenSelectorType}
          setInputSide={setInputSide}
          swapValues={swapValues}
          setShowTxModal={setShowTxModal}
          label="Amount"
        />

        {fromValues.coin && toValues.coin && (
          <>
            {gameEditionView ? (
              <>
                <InfoContainer style={{ marginTop: 16 }}>
                  <PixeledBlueContainer
                    label={`${toValues.coin}/${fromValues.coin}`}
                    value={reduceBalance(pact.getRatio(toValues.coin, fromValues.coin)) ?? '-'}
                  />
                  <PixeledBlueContainer
                    label={`${fromValues.coin}/${toValues.coin}`}
                    value={reduceBalance(pact.getRatio1(fromValues.coin, toValues.coin)) ?? '-'}
                  />
                  <PixeledBlueContainer
                    label="pool share"
                    value={`${!pact.share(fromValues.amount) ? 0 : (pact.share(fromValues.amount) * 100).toPrecision(4)} %`}
                  />
                </InfoContainer>
              </>
            ) : (
              <>
                <div className="flex justify-sb" style={{ marginTop: 16 }}>
                  <FlexContainer className="column w-100">
                    <Label fontSize={13}>{`${toValues.coin}/${fromValues.coin}`}</Label>
                    <Label fontSize={13} labelStyle={{ textAlign: 'end' }}>
                      {reduceBalance(pact.getRatio(toValues.coin, fromValues.coin)) ?? '-'}
                    </Label>
                  </FlexContainer>
                  <FlexContainer className="column align-ce w-100">
                    <Label fontSize={13}>{`${fromValues.coin}/${toValues.coin}`}</Label>
                    <Label fontSize={13} labelStyle={{ textAlign: 'end' }}>
                      {reduceBalance(pact.getRatio1(fromValues.coin, toValues.coin)) ?? '-'}
                    </Label>
                  </FlexContainer>
                  <FlexContainer className="column align-fe w-100">
                    <Label fontSize={13}>Pool Share</Label>
                    <Label fontSize={13} labelStyle={{ textAlign: 'end' }}>
                      {!pact.share(fromValues.amount) ? 0 : (pact.share(fromValues.amount) * 100).toPrecision(4)} %
                    </Label>
                  </FlexContainer>
                </div>
              </>
            )}
          </>
        )}
      </FormContainer>
    </>
  );
};

export default DoubleSidedLiquidity;