// src/WeekPicksTable.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useSortBy } from 'react-table';

function WeekPicksTable() {
  const [data, setData] = useState([]);

  // Fetch the JSON data
  useEffect(() => {
    fetch('/weekPicks.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(jsonData => {
        console.log('Fetched data:', jsonData);
        // Transform the data: flatten the nested arrays into a single array
        const flattenedData = Object.values(jsonData).flat();
        setData(flattenedData);
      })
      .catch(error => {
        console.error('Error fetching JSON data:', error);
      });
  }, []);

  // Define the columns for the table
  const columns = useMemo(
    () => [
      { Header: 'Username', accessor: 'username' },
      { Header: 'Entry Number', accessor: 'entryNumber' },
      { Header: 'Status', accessor: 'status' },
      { Header: 'Eliminated Week', accessor: 'eliminatedWeek' },
      { Header: 'Week', accessor: 'week' },
      { Header: 'Picked Team', accessor: 'pickedTeam' },
      { Header: 'Pick Result', accessor: 'pickResult' },
      {
        Header: 'Is Win',
        accessor: 'isWin',
        Cell: ({ value }) => (value ? 'Yes' : 'No'), // Format boolean values
      },
    ],
    []
  );

  // Use the useTable hook provided by react-table
  const tableInstance = useTable({ columns, data }, useSortBy);

  // Destructure the properties needed for rendering
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy },
  } = tableInstance;

  return (
    <div>
      <h1>NFL Survivor Pool Picks</h1>
      {data.length === 0 ? (
        <p>Loading data...</p>
      ) : (
        <table {...getTableProps()} border="1" cellPadding="5" cellSpacing="0">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    key={column.id}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    style={{ cursor: 'pointer', background: '#f0f0f0' }}
                  >
                    {column.render('Header')}
                    {/* Add a sort direction indicator */}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ' ↕'}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map(row => {
                prepareRow(row);
                return (
                  <tr key={row.id} {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td key={cell.column.id} {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default WeekPicksTable;
