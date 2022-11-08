import React, { useCallback, useEffect, useState } from "react";
import { InfiniteScrollTable } from "@contentstack/venus-components";
interface InfinteProps {
  itemStatusMap: any;
  data: any;
  totalCounts: any;
  loading: boolean;
  status: boolean;
  fetchData: (data: any) => void;
  loadMoreItems: (data: any) => void;
  getSelectedRow: (data: any) => void;
}

const InfinteTable: React.FC<InfinteProps> = function ({
  data,
  fetchData,
  itemStatusMap,
  loadMoreItems,
  totalCounts,
  loading,
  getSelectedRow,
  status,
}: InfinteProps) {
  const columns: any = [
    {
      Header: "Uid",
      id: "uid",
      accessor: "uid",
      addToColumnSelector: true,
      default: true,
    },
    {
      Header: "Title",
      id: "title",
      accessor: "title",
      addToColumnSelector: true,
      default: true,
      disableSortBy: false,
    },

    {
      Header: "Field Name",
      id: "fieldName",
      accessor: "fieldName",
      addToColumnSelector: true,
      default: true,
      disableSortBy: true,
    },
    {
      Header: "Value",
      id: "value",
      accessor: "value",
      addToColumnSelector: true,
      default: true,
      disableSortBy: true,
    },
    {
      Header: "Status",
      id: "status",
      accessor: "status",
      addToColumnSelector: true,
      default: true,
      disableSortBy: true,
    },
  ];

  return (
    <InfiniteScrollTable
      className="projectTable"
      data={data}
      columns={columns}
      uniqueKey="uid"
      fetchTableData={fetchData}
      totalCounts={totalCounts}
      loadMoreItems={loadMoreItems}
      hiddenColumns={status ? ["uid"] : ["uid", "status"]}
      // eslint-disable-next-line
      itemStatusMap={itemStatusMap}
      loading={loading}
      equalWidthColumns
      minBatchSizeToFetch={30}
      canOrderColumn
      columnSelector
      searchPlaceholder="Search Title"
      isRowSelect
      canSearch
      canRefresh
      getSelectedRow={getSelectedRow}
    />
  );
};

export default InfinteTable;
