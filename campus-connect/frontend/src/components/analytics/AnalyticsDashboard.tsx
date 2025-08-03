import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CircularProgress,
  Tabs, Tab, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  TrendingUp, People, Schedule, Star, Assessment, Timeline
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService } from '../../services/apiService';

interface MetricCard {
  title: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState<any>({});

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.analytics.getComprehensiveMetrics();
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const metricCards: MetricCard[] = [
    {
      title: 'Total Sessions',
      value: metrics.totalSessions || 0,
      change: 12.5,
      icon: <Schedule />,
      color: '#2196F3'
    },
    {
      title: 'Active Mentors',
      value: metrics.activeMentors || 0,
      change: 8.2,
      icon: <People />,
      color: '#4CAF50'
    },
    {
      title: 'Avg Rating',
      value: metrics.averageRating || '0.0',
      change: 5.1,
      icon: <Star />,
      color: '#FF9800'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate || 0}%`,
      change: 3.7,
      icon: <TrendingUp />,
      color: '#9C27B0'
    }
  ];

  const sessionData = metrics.sessionTrends || [];
  const engagementData = metrics.engagementData || [];
  const categoryData = metrics.categoryBreakdown || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment /> Analytics Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metricCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: card.change > 0 ? 'success.main' : 'error.main' }}>
                      {card.change > 0 ? '+' : ''}{card.change}% from last period
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Session Trends" />
          <Tab label="Engagement" />
          <Tab label="Categories" />
          <Tab label="Performance" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ height: 400 }}>
            <Typography variant="h6" gutterBottom>Session Activity Over Time</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="sessions" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ height: 400 }}>
            <Typography variant="h6" gutterBottom>User Engagement Metrics</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="retention" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Session Categories</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Category Performance</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        )}

        {tabValue === 3 && (
          <Box sx={{ height: 400 }}>
            <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.performanceData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#8884d8" name="Current Period" />
                <Bar dataKey="previous" fill="#82ca9d" name="Previous Period" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard;