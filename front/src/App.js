import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    TextField, 
    Grid, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Box,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BRANCHES = ['IFI', 'IIT', 'IIB']; // Filter options for branches

const StudentDashboard = () => {
    const [studentData, setStudentData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [branchAverages, setBranchAverages] = useState({});
    const [rankType, setRankType] = useState('overall'); // 'overall' or 'branch'
    const [selectedBranch, setSelectedBranch] = useState(''); // Selected branch
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

    // Load student data from JSON file
    useEffect(() => {
        const loadStudentData = async () => {
            try {
                const response = await fetch('./final.json');
                const parsedData = await response.json();

                // Transform the parsed data
                const formattedData = parsedData.map(entry => ({
                    Student_Name: entry['Student Name']?.content.split('Student Name :')[1]?.trim() || 'N/A',
                    Enrolment_No: entry['Enrolment No.']?.content.split(':')[2]?.trim() || 'N/A',
                    APAAR_ID: entry['Enrolment No.']?.content.split(':')[1]?.trim() || 'N/A',
                    CGPA: parseFloat(entry['CGPA']?.content.split(':')[1]?.trim()) || 'N/A',
                    Branch: entry['Enrolment No.']?.content.split(':')[2]?.trim().slice(0, 3) || 'Unknown'
                }));

                setStudentData(formattedData);
                setFilteredData(formattedData);
            } catch (error) {
                console.error('Error loading student data:', error);
            }
        };

        loadStudentData();
    }, []);

    // Calculate branch averages
    useEffect(() => {
        if (studentData.length === 0) return;

        const averages = BRANCHES.reduce((acc, branch) => {
            const branchStudents = studentData.filter(
                student => student.Branch === branch && !isNaN(student.CGPA) && student.CGPA!='N/A' // Exclude invalid CGPA
            );
            const avgCGPA = branchStudents.length > 0 
                ? branchStudents.reduce((sum, student) => sum + student.CGPA, 0) / branchStudents.length
                : 0;
            return {
                ...acc,
                [branch]: {
                    students: branchStudents.length,
                    avgCGPA: avgCGPA.toFixed(2)
                }
            };
        }, {});

        setBranchAverages(averages);
    }, [studentData]);

    // Search and filter functionality
    useEffect(() => {
        const filtered = studentData.filter(student => 
            student.Student_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.Enrolment_No.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.APAAR_ID.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(filtered);
    }, [searchTerm, studentData]);

    // Sorting functionality
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const sortedData = [...filteredData].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });

        setFilteredData(sortedData);
        setSortConfig({ key, direction });
    };

    // Function to assign ranks based on CGPA
    const assignRanks = (data, isBranchWise = false, branchFilter = '') => {
        let sortedData;
        if (isBranchWise && branchFilter) {
            // Rank within the selected branch
            const branchData = data.filter(student => student.Branch === branchFilter);
            sortedData = branchData.sort((a, b) => b.CGPA - a.CGPA).map((student, index) => ({
                ...student,
                Rank: index + 1,
            }));
        } else {
            // Overall rank across all branches
            sortedData = [...data].sort((a, b) => b.CGPA - a.CGPA).map((student, index) => ({
                ...student,
                Rank: index + 1,
            }));
        }
        return sortedData;
    };

    // Calculate overall statistics
    const overallStats = studentData.length > 0 ? {
        totalStudents: studentData.length,
        overallAvgCGPA: (studentData.reduce((sum, student) => sum + (isNaN(student.CGPA) ? 0 : student.CGPA), 0) / studentData.length).toFixed(2),
        highestCGPA: Math.max(...studentData.map(s => isNaN(s.CGPA) ? 0 : s.CGPA)).toFixed(2),
        lowestCGPA: Math.min(...studentData.map(s => isNaN(s.CGPA) ? Infinity : s.CGPA)).toFixed(2)
    } : {
        totalStudents: 0,
        overallAvgCGPA: 'N/A',
        highestCGPA: 'N/A',
        lowestCGPA: 'N/A'
    };

    // Rank the students based on the selected type (overall or branch)
    const rankedData = assignRanks(filteredData, rankType === 'branch', selectedBranch);

    return (
        <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'background.default' }}>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                align="center" 
                color="primary"
            >
                Student Performance Dashboard
            </Typography>

            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Search by Name, Enrollment, or APAAR ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon />
                    }}
                />
            </Box>

            {/* Rank Type Selection */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Rank Type</InputLabel>
                        <Select
                            value={rankType}
                            label="Rank Type"
                            onChange={(e) => setRankType(e.target.value)}
                        >
                            <MenuItem value="overall">Overall Rank</MenuItem>
                            <MenuItem value="branch">Rank by Branch</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Branch Selection for Branch-wise Ranking */}
                {rankType === 'branch' && (
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Branch</InputLabel>
                            <Select
                                value={selectedBranch}
                                label="Branch"
                                onChange={(e) => setSelectedBranch(e.target.value)}
                            >
                                <MenuItem value="">All Branches</MenuItem>
                                {BRANCHES.map(branch => (
                                    <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                )}
            </Grid>

            {/* Overall Statistics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {Object.entries(overallStats).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    {key.replace(/([A-Z])/g, ' $1')}
                                </Typography>
                                <Typography variant="h5" component="div">
                                    {value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Branch Averages Chart */}
            <Card sx={{ mb: 3 }}>
                <CardHeader title="Branch-wise Average CGPA" />
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={Object.entries(branchAverages).map(([branch, { avgCGPA, students }]) => ({
                            name: branch,
                            avgCGPA: parseFloat(avgCGPA),
                            students
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="avgCGPA" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Student Table */}
            <Card>
                <CardHeader title="Student Data" />
                <CardContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Rank</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleSort('Student_Name')}>Student Name</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleSort('Enrolment_No')}>Enrolment No.</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleSort('CGPA')}>CGPA</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleSort('Branch')}>Branch</Button>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rankedData.map((student, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{student.Rank}</TableCell>
                                        <TableCell>{student.Student_Name}</TableCell>
                                        <TableCell>{student.Enrolment_No}</TableCell>
                                        <TableCell>{student.CGPA}</TableCell>
                                        <TableCell>{student.Branch}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Container>
    );
};

export default StudentDashboard;
