import React from 'react';
import styled from 'styled-components';
import { FlexContainer } from './FlexContainer';
import Label from './Label';
import LogoLoader from './Loader';

const Wrapper = styled(FlexContainer)`
  /* background-color: ${({ theme: { backgroundContainer } }) => backgroundContainer}; */
  /* *::-webkit-scrollbar-corner {
    background: ${({ theme: { backgroundContainer } }) => backgroundContainer};
  } */
  table {
    border-collapse: collapse;
    border-spacing: 0px;
    width: 100%;
    position: relative;
    overflow: auto;
  }
  .sticky {
    position: -webkit-sticky;
    position: sticky;
    left: 0px;
    z-index: 2;
  }
  .tr-sticky:after {
    content: '';
    background: -webkit-linear-gradient(left, #ed1cb5 0%, #ffa900 12%, #39fffc 47%);
    display: block;
    height: 1px;
    width: 100%;
    position: absolute;
    z-index: 10;
    bottom: 0px;
    left: 0px;
  }
  th {
    font-weight: normal;
  }
  /* td,
  th {
    background-color: ${({ theme: { backgroundContainer } }) => backgroundContainer};
  } */
  tbody {
    & > tr {
      border-bottom: 1px solid ${({ theme: { colors } }) => `${colors.white}66`};
    }
  }
`;

const CommonTable = ({ columns, items, hasMore, loadMore, loading }) => {
  return (
    <Wrapper withGradient className="w-100 relative hidden column transparent">
      <FlexContainer className="w-100 x-auto scrollbar-y-none">
        <table cellSpacing={0} cellPadding={24}>
          <thead>
            <tr className="tr-sticky" style={{ position: 'sticky', zIndex: 3, top: 0 }}>
              {columns.map((c, i) => (
                <th colSpan={1} key={i} className={i === 0 ? 'sticky' : ''} style={{ minWidth: c.width, paddingTop: 0 }}>
                  {typeof c.name === 'string' ? (
                    <Label fontSize={13} className={`capitalize ${c?.align === 'right' ? 'justify-fe' : ''}`}>
                      {c.name}
                    </Label>
                  ) : (
                    c.name
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                {columns.map((c, j) => (
                  <td key={j} className={j === 0 ? 'sticky' : ''} style={{ minWidth: c.width }}>
                    <Label fontSize={13} className={c?.align === 'right' ? 'justify-fe' : ''}>
                      {c.render({ item, column: c })}
                    </Label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </FlexContainer>
      {hasMore && !loading && (
        <FlexContainer
          style={{ marginTop: 16 }}
          className="pointer justify-ce"
          onClick={async () => {
            await loadMore();
          }}
        >
          <Label fontSize={13} fontFamily="syncopate">
            Load more
          </Label>
        </FlexContainer>
      )}
      {loading && <LogoLoader containerStyle={{ marginTop: 16 }} />}
    </Wrapper>
  );
};

export default CommonTable;