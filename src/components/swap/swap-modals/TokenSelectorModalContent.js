import React, { useState, useContext } from 'react';
import styled from 'styled-components/macro';
import Search from '../../../shared/Search';
import { SwapContext } from '../../../contexts/SwapContext';
import { reduceBalance } from '../../../utils/reduceBalance';
import { GameEditionContext } from '../../../contexts/GameEditionContext';
import theme from '../../../styles/theme';

const Label = styled.span`
  font-size: 13px;
  font-family: ${({ theme: { fontFamily }, gameEditionView }) =>
    gameEditionView ? fontFamily.pressStartRegular : fontFamily.bold};
  text-transform: capitalize;
  text-align: left;
`;

const Divider = styled.div`
  border: 1px solid #ecebec;
  margin: 16px 0px;
  width: 100%;
`;

const TokensContainer = styled.div`
  display: flex;
  flex-flow: column;

  & > div:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const TokenItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  font-family: ${({ theme: { fontFamily }, gameEditionView }) =>
    gameEditionView ? fontFamily.pressStartRegular : fontFamily.regular};
  color: ${({ selected }) => (selected ? 'white' : '')};
  svg {
    margin-right: 8px;
    width: 24px;
    height: 24px;
  }
`;

const TokenSelectorModalContent = ({
  show,
  selectedToken,
  onTokenClick,
  onClose,
  fromToken,
  toToken,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const swap = useContext(SwapContext);
  const { gameEditionView } = useContext(GameEditionContext);

  console.log('selectedToken', selectedToken);

  return (
    <>
      <Label gameEditionView={gameEditionView} style={{ marginBottom: 4 }}>
        search token
      </Label>
      <Search
        fluid
        containerStyle={{
          marginBottom: 15,
          borderRadius: '4px',
          border: gameEditionView
            ? `2px dashed ${theme.colors.black}`
            : `1px solid ${theme.colors.white}`,
          color: gameEditionView && `${theme.colors.black}`,
          /* boxShadow: "0 0 5px #FFFFFF" */
        }}
        placeholder='Search'
        value={searchValue}
        onChange={(e, { value }) => setSearchValue(value)}
      />
      <Label gameEditionView={gameEditionView} style={{ marginBottom: '0px' }}>
        token
      </Label>
      <Divider
        style={{
          border: gameEditionView && `1px dashed ${theme.colors.black}`,
        }}
      />
      <TokensContainer>
        {Object.values(swap.tokenData)
          .filter((c) => {
            const code = c.code !== 'coin' ? c.code.split('.')[1] : c.code;
            return (
              code
                .toLocaleLowerCase()
                .includes(searchValue?.toLocaleLowerCase()) ||
              c.name.toLowerCase().includes(searchValue?.toLowerCase())
            );
          })
          .map((crypto) => {
            return (
              <TokenItem
                gameEditionView={gameEditionView}
                key={crypto.name}
                active={
                  selectedToken === crypto.name ||
                  fromToken === crypto.name ||
                  toToken === crypto.name
                }
                // active={selectedToken === crypto.name}
                selected={selectedToken === crypto.name}
                style={{
                  cursor: selectedToken === crypto.name ? 'default' : 'pointer',
                }}
                onClick={() => {
                  if (fromToken === crypto.name || toToken === crypto.name)
                    return;
                  if (selectedToken !== crypto.name) {
                    onTokenClick({ crypto });
                    setSearchValue('');
                    onClose();
                  }
                }}
              >
                {crypto.icon}
                {crypto.name}
                {selectedToken === crypto.name ? (
                  <Label style={{ marginLeft: 5 }}>(Selected)</Label>
                ) : (
                  <></>
                )}
                <span
                  style={{
                    marginLeft: 'auto',
                    marginRight: 1,
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  {crypto.balance
                    ? `${reduceBalance(crypto.balance).toFixed(
                        crypto.precision
                      )} ${crypto.name}`
                    : ''}
                </span>
              </TokenItem>
            );
          })}
      </TokensContainer>
    </>
  );
};

export default TokenSelectorModalContent;