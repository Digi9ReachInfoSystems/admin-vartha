import styled from "styled-components";

export const LongVideoWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: hidden;

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;
    flex-wrap: wrap;
  }

  .block-title {
    font-size: 20px;
    font-weight: bold;
  }

  .block-Table {
    margin-top: 16px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: hidden;
  }

  .add-article-btn {
    background-color: #1890ff;
    border-color: #1890ff;
    color: white;
  }

  .add-article-btn:hover {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }
`;
