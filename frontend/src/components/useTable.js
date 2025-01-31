import React, { useState } from 'react'
import { Table, TableHead, TableRow, TableCell, makeStyles, TablePagination, TableSortLabel } from '@material-ui/core';
import TableContainer from '@material-ui/core/TableContainer';

const useStyles = makeStyles(theme => ({
    table: {
        marginTop: theme.spacing(3),
        '& thead th': {
            fontWeight: '600',
            color: theme.palette.primary.main,
         /*    backgroundColor: theme.palette.primary.light, */
        },
        '& tbody td': {
            fontWeight: '300',
        },
        '& tbody tr:hover': {
            backgroundColor: '#fffbf2',
            cursor: 'pointer',
        }
    
    },
    root: {
        width: '100%',
      },
    container: {
       
      },
}))



export default function useTable(records, headCells,filterFn) {

    const classes = useStyles();

    const pages = [8, 30, 50, records.length]
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(pages[page])
    const [order, setOrder] = useState()
    const [orderBy, setOrderBy] = useState()

    const TblContainer = props => (
        <TableContainer className={classes.container} style={{maxHeight:props.maxHeight ? props.maxHeight : '100%'}}>
        <Table  /* className={classes.table} */  className="table table-striped table-hover table-sm ">
            {props.children}
        </Table>
        </TableContainer>
    )

    const TblHead = props => {

        const handleSortRequest = cellId => {
            const isAsc = orderBy === cellId && order === "asc";
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(cellId)
        }

        return (<TableHead >
            <TableRow>
                {
                    headCells.map(headCell => (
                        <TableCell key={headCell.id} style={{fontFamily: headCell.fontFamily,textAlign: headCell.textAlign, fontWeight: 'bold', backgroundColor: headCell.backgroundColor, color: headCell.color, fontSize: headCell.fontSize, padding: headCell.padding, margin: headCell.margin}}
                            sortDirection={orderBy === headCell.id ? order : false}>
                            {headCell.disableSorting ? headCell.label :
                                /*  <TableSortLabel
                                   active={orderBy === headCell.id}
                                     direction={orderBy === headCell.id ? order : 'asc'}
                                    onClick={() => { handleSortRequest(headCell.id) }} >
                                   
                                </TableSortLabel>*/
                                 headCell.label
                            }
                        </TableCell>))
                }
            </TableRow>
        </TableHead>)
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    }

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0);
    }

    const TblPagination = () => (<TablePagination
        component="div"
        page={page}
        rowsPerPageOptions={pages}
        rowsPerPage={rowsPerPage}
        labelRowsPerPage='Filas'
        count={records.length}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
    />)

    function stableSort(array, comparator) {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    function getComparator(order, orderBy) {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    function descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    const recordsAfterPagingAndSorting = () => {
        return stableSort(filterFn.fn(records), getComparator(order, orderBy))
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    }

    return {
        TblContainer,
        TblHead,
        TblPagination,
        recordsAfterPagingAndSorting
    }
}