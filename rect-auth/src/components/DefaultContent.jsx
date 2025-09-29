import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import {
  studentApi,
  schoolApi,
  userApi,
  attendanceApi,
} from "../services/ApiService";
import {
  BarChart,
  PieChart,
  LineChart,
  ChartContainer,
  ChartsXAxis,
  ChartsYAxis,
  BarPlot,
  LinePlot,
  MarkPlot,
} from "@mui/x-charts";

const DefaultContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    studentCount: 0,
    schoolCount: 0,
    employeeCount: 0,
    attendanceCount: 0,
  });

  const [timeRange, setTimeRange] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [studentMonthlyData, setStudentMonthlyData] = useState([]);
  const [schoolDistribution, setSchoolDistribution] = useState([]);
  const [schoolTotal, setSchoolTotal] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const requests = [
          studentApi.getAll(),
          schoolApi.getAll(),
          userApi.getAll(),
          attendanceApi.getAll(),
        ];

        const responses = await Promise.allSettled(requests);

        const studentData =
          responses[0].status === "fulfilled"
            ? responses[0].value.data?.data || []
            : [];
        const schoolData =
          responses[1].status === "fulfilled"
            ? responses[1].value.data?.data || []
            : [];
        const userData =
          responses[2].status === "fulfilled"
            ? responses[2].value.data?.data || []
            : [];
        const attendanceData =
          responses[3].status === "fulfilled"
            ? responses[3].value.data?.data || []
            : [];

        const employeeData = userData.filter(
          (user) =>
            user.role &&
            ["employee", "hr_admin", "supervisor", "leader"].includes(user.role)
        );

        const attendanceStatsCalc = attendanceData.reduce(
          (acc, a) => {
            if (a.status) acc[a.status] = (acc[a.status] || 0) + 1;
            return acc;
          },
          { present: 0, absent: 0, late: 0 }
        );

        setStats({
          studentCount: studentData.length,
          schoolCount: schoolData.length,
          employeeCount: employeeData.length,
          attendanceCount: attendanceData.length,
        });

        setAttendanceStats(attendanceStatsCalc);

        // Generate monthly data
        const months = [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月",
        ];
        const monthlyData = months.map((m, idx) => {
          const count = studentData.filter((student) => {
            if (!student.created_at) return false;
            const date = new Date(student.created_at);
            return date.getMonth() === idx;
          }).length;

          return { month: m, count };
        });

        setStudentMonthlyData(monthlyData);

        // School distribution
        const distribution = schoolData.map((school) => {
          const value = studentData.filter(
            (student) => student.school_id === school.id
          ).length;
          return {
            id: school.id,
            label: school.name,
            value,
          };
        });
        const total = distribution.reduce((sum, item) => sum + item.value, 0);

        setSchoolDistribution(distribution);
        setSchoolTotal(total);
      } catch (err) {
        console.error(err);
        setError("データの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>データを読み込み中...</Typography>
      </Box>
    );

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{marginBottom: 5}}>
        ダッシュボード
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards - Fixed width issue */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 3,
          marginBottom: 5,
        }}
      >
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            backgroundColor: "primary.light",
            color: "white",
            width: "100%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            インターンシップ数
          </Typography>
          <Typography variant="h3" fontWeight="bold">
            {stats.studentCount} 人
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            backgroundColor: "#0BA6DF",
            color: "white",
            width: "100%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            大学数
          </Typography>
          <Typography variant="h3" fontWeight="bold">
            {stats.schoolCount} 個
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            backgroundColor: "#FAA533",
            color: "white",
            width: "100%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            正社員数
          </Typography>
          <Typography variant="h3" fontWeight="bold">
            {stats.employeeCount} 人
          </Typography>
        </Paper>
      </Box>

      {/* Charts Row 1 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Paper sx={{ p: 3, height: "100%", width: "50%" }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            月別インターンシップ登録数 ({year}年)
          </Typography>
          <Box sx={{ height: 300 }}>
            <LineChart
              xAxis={[
                {
                  data: studentMonthlyData.map((d) => d.month),
                  scaleType: "band",
                },
              ]}
              series={[
                {
                  data: studentMonthlyData.map((d) => d.count),
                  label: "生徒数",
                  color: "#1976d2",
                },
              ]}
              margin={{ left: 70, right: 30, top: 30, bottom: 50 }}
              grid={{ vertical: true, horizontal: true }}
            />
          </Box>
        </Paper>
        <Paper sx={{ p: 3, height: "100%", width: "50%" }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            出席状況
          </Typography>
          <Box sx={{ height: 300 }}>
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: ["出席", "欠席", "遅刻"],
                },
              ]}
              series={[
                {
                  data: [
                    attendanceStats.present,
                    attendanceStats.absent,
                    attendanceStats.late,
                  ],
                  color: "#9c27b0",
                },
              ]}
              margin={{ left: 70, right: 30, top: 30, bottom: 50 }}
            />
          </Box>
        </Paper>
      </Box>
      <Box sx={{ marginTop: 5 }}>
        <Paper sx={{ p: 3, height: "100%", width: "100%" }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            大学別インターンシップ分布
          </Typography>
          <Box
            sx={{
              height: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PieChart
              series={[
                {
                  data: schoolDistribution.map((school, index) => ({
                    id: school.id,
                    value: school.value,
                    label: `${school.label} (${school.value}人 / ${schoolTotal > 0
                        ? ((school.value / schoolTotal) * 100).toFixed(1)
                        : 0
                      }%)`,
                    color: [
                      "#4CAF50",
                      "#2196F3",
                      "#FF9800",
                      "#E91E63",
                      "#9C27B0",
                      "#00BCD4",
                    ][index % 6],
                  })),
                  innerRadius: 30,
                  outerRadius: 100,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  label: {
                    fontSize: 12,
                    fontWeight: "bold",
                    color: "#fff",
                  },
                  tooltip: (d) => d.label,
                },
              ]}
              margin={{ right: 5 }}
              width={300}
              height={300}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DefaultContent;
