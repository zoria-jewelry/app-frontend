import { InputBase } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: 6,
    border: '1px solid black',
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    display: 'flex',
    alignItems: 'center',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
    },
}));

export interface SearchBarProps {
    consumer: (data: string) => void;
}

const SearchBar = (props: SearchBarProps) => {
    return (
        <Search>
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
                onChange={(e) => props.consumer(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
            />
        </Search>
    );
};

export default SearchBar;
