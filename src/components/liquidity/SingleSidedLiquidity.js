/* eslint-disable react-hooks/exhaustive-deps */
import Pact from 'pact-lang-api';
import React, { useEffect, useState } from 'react';
import { ArrowDown } from '../../assets';
import { CHAIN_ID, creationTime, NETWORK } from '../../constants/contextConstants';
import tokenData from '../../constants/cryptoCurrencies';
import { useAccountContext, useModalContext, usePactContext } from '../../contexts';
import noExponents from '../../utils/noExponents';
import { getCorrectBalance, limitDecimalPlaces, reduceBalance } from '../../utils/reduceBalance';
import SelectPoolModal from '../modals/liquidity/SelectPoolModal';
import TokenSelectorModalContent from '../modals/swap-modals/TokenSelectorModalContent';
import CustomButton from '../shared/CustomButton';
import { CryptoContainer, FlexContainer } from '../shared/FlexContainer';
import Input from '../shared/Input';
import InputToken from '../shared/InputToken';
import Label from '../shared/Label';

const SingleSidedLiquidity = ({ pair, pools, onPairChange }) => {
  const modalContext = useModalContext();

  const pact = usePactContext();
  const account = useAccountContext();

  const [selectedPool, setSelectedPool] = useState(null);

  const [values, setValues] = useState({
    coin: pair?.token0 || 'KDX',
    account: '',
    guard: null,
    balance: account?.account?.balance,
    amount: '',
    precision: 12,
  });

  // useEffect(() => {
  //   onPairChange(values.coin);
  //   handleTokenValue(pair?.token0 || 'KDA');
  // }, [pair.coin]);

  useEffect(() => {
    setSelectedPool(pools[0]);
    handleTokenValue(pair?.token0 || 'KDX');
  }, []);

  const handleTokenValue = async (token) => {
    const crypto = tokenData[token];

    let balance;
    if (crypto?.code === 'coin') {
      if (account.account) {
        balance = account.account.balance;
      }
    } else {
      let data = await Pact.fetch.local(
        {
          pactCode: `(${crypto.code}.details ${JSON.stringify(account.account.account)})`,
          keyPairs: Pact.crypto.genKeyPair(),
          meta: Pact.lang.mkMeta('', CHAIN_ID, 0.01, 100000000, 28800, creationTime()),
        },
        NETWORK
      );
      if (data.result.status === 'success') {
        balance = getCorrectBalance(data.result.data.balance);
      }
    }
    setValues((prev) => ({
      ...prev,
      balance: balance,
      coin: crypto?.name,
      precision: crypto?.precision,
    }));
    onPairChange(token);
  };

  const openTokenSelectorModal = () => {
    modalContext.openModal({
      title: 'Select',
      description: '',

      onClose: () => {
        modalContext.closeModal();
      },
      content: (
        <TokenSelectorModalContent
          token={values.coin}
          tokensToKeep={[selectedPool?.token0, selectedPool?.token1]}
          onSelectToken={async (crypto) => await handleTokenValue(crypto.name)}
          onClose={() => {
            modalContext.closeModal();
          }}
        />
      ),
    });
  };

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
    if (!account.account) return status[0];
    if (isNaN(pact.ratio)) {
      return status[4];
    } else if (!values.amount) return status[1];
    else if (Number(values.amount) > Number(values.balance)) return { ...status[3], msg: status[3].msg(values.coin) };
    else {
      if (isNaN(pact.ratio)) {
        return status[4];
      } else return status[2];
    }
  };

  return (
    <FlexContainer className="column background-fill" gap={16} withGradient style={{ padding: 24 }}>
      <Label fontSize={13}>Pool</Label>
      <CustomButton
        type="primary"
        buttonStyle={{ borderRadius: 4, height: 40, marginBottom: 8 }}
        onClick={() => {
          modalContext.openModal({
            title: 'Select',

            onClose: () => {
              modalContext.closeModal();
            },
            content: (
              <SelectPoolModal
                pools={pools}
                onSelect={(pool) => {
                  setSelectedPool(pool);
                  modalContext.closeModal();
                  setValues((prev) => ({ ...prev, coin: pool.token0 }));
                }}
                onClose={() => {
                  modalContext.closeModal();
                }}
              />
            ),
          });
        }}
      >
        <div className="flex align-ce w-100 justify-sb">
          <div className="flex align-ce w-100">
            <div className="flex align-ce">
              <CryptoContainer size={22} style={{ zIndex: 2 }}>
                {tokenData?.[selectedPool?.token0]?.icon}
              </CryptoContainer>
              <CryptoContainer size={22} style={{ marginLeft: -12, zIndex: 1 }}>
                {tokenData?.[selectedPool?.token1]?.icon}{' '}
              </CryptoContainer>
            </div>
            <Label fontSize={13}>
              {selectedPool?.token0}/{selectedPool?.token1}
            </Label>
          </div>
          <ArrowDown />
        </div>
      </CustomButton>

      <Input
        error={isNaN(values.amount)}
        topLeftLabel="amount"
        topRightLabel={`balance: ${reduceBalance(values.balance) ?? '-'}`}
        bottomLeftLabel={`balance: ${reduceBalance(values.balance) ?? '-'}`} //using for gameEdition
        geColor="black"
        placeholder="0.0"
        maxLength="15"
        numberOnly
        inputRightComponent={
          <InputToken
            geColor="black"
            values={values}
            disabledButton={!values.balance}
            onClick={() => {
              openTokenSelectorModal();
            }}
            onMaxClickButton={() => {
              setValues((prev) => ({
                ...prev,
                amount: reduceBalance(values.balance),
              }));
            }}
          />
        }
        value={noExponents(values.amount)}
        onChange={async (e, { value }) => {
          setValues((prev) => ({
            ...prev,
            amount: limitDecimalPlaces(value, values.precision),
          }));
        }}
      />

      <FlexContainer className="justify-sb w-100">
        <Label fontSize={13}>Pool Share</Label>
        <Label fontSize={13} labelStyle={{ textAlign: 'end' }}>
          {!pact.share(values.amount) ? 0 : (pact.share(values.amount) * 100).toPrecision(4)} %
        </Label>
      </FlexContainer>

      <CustomButton fluid type="gradient" disabled={!buttonStatus().status} onClick={() => console.log('add')}>
        {buttonStatus().msg}
      </CustomButton>
    </FlexContainer>
  );
};

export default SingleSidedLiquidity;