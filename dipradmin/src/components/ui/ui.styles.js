import styled from "styled-components";

export const PageHeaderRoot = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;

  .ph-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .ph-title {
    margin: 0 !important;
    color: #111827 !important;
    font-weight: 700 !important;
    font-size: 22px !important;
    line-height: 1.25 !important;
  }

  .ph-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

export const StatsCardRoot = styled.button`
  width: 100%;
  text-align: left;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  border-top: 3px solid ${(p) => p.$accent || "#005BAC"};
  padding: 18px 18px 16px;
  box-shadow: 0 1px 3px rgba(17, 24, 39, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 124px;

  &:hover {
    transform: ${(p) => (p.$clickable ? "translateY(-3px)" : "none")};
    box-shadow: ${(p) =>
      p.$clickable
        ? "0 8px 24px rgba(17, 24, 39, 0.08)"
        : "0 1px 3px rgba(17, 24, 39, 0.06)"};
  }

  .sc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sc-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => p.$iconBg || "rgba(0, 91, 172, 0.08)"};
    color: ${(p) => p.$accent || "#005BAC"};
  }

  .sc-value {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .sc-label {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    margin-top: 2px;
  }

  .sc-sub {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }
`;

export const DataTableShellRoot = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(17, 24, 39, 0.06);
  overflow: hidden;

  .dts-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 16px 16px 8px;
  }

  .dts-body {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding: 0 8px 8px;
    overflow-x: auto;

    .ant-table-sticky-holder {
      border-radius: 0;
    }

    .ant-pagination {
      margin: 16px 8px !important;
    }
  }
`;

export const EmptyStateRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
  gap: 10px;

  .es-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #005bac;
    margin-bottom: 4px;
  }

  .es-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .es-desc {
    font-size: 13px;
    max-width: 320px;
    line-height: 1.5;
  }
`;

export const SearchBarRoot = styled.div`
  max-width: 320px;
  width: 100%;

  .ant-input-affix-wrapper {
    border-radius: 10px;
  }
`;

export const FormCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(17, 24, 39, 0.06);
  padding: 24px;

  .ant-form-item-label > label {
    font-weight: 600;
    color: #111827;
  }

  @media (max-width: 576px) {
    padding: 16px;
  }
`;

export const IconActionBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.$danger ? "#DC2626" : "#005BAC"};
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${(p) => (p.$danger ? "#FEF2F2" : "#EFF6FF")};
    border-color: ${(p) => (p.$danger ? "#FECACA" : "#BFDBFE")};
  }
`;
