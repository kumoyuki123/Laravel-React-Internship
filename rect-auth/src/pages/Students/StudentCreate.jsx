import React, { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { studentApi, schoolApi } from "../../services/ApiService";
import { useNavigate } from "react-router-dom";
import { nrcCodes, nrcTownships, nrcTypes } from "../../constants/nrcConstants";

export default function StudentCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [schools, setSchools] = useState([]);
  const [nrc, setNrc] = useState({
    nrcCode: "",
    nrcTownship: "",
    nrcType: "",
    nrcNumber: "",
  });

  const [formData, setFormData] = useState({
    school_id: "",
    roll_no: "",
    branch: "mdy", // Default to Mandalay
    name: "",
    email: "",
    phone: "",
    major: "",
    year: "",
    iq_score: "",
  });

  // fetch schools for dropdown
  useEffect(() => {
    schoolApi.getAll().then((res) => {
      if (res.data.success) {
        setSchools(res.data.data);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNrcChange = (e) => {
    const { name, value } = e.target;
    setNrc((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors.nrc_no) {
      setFieldErrors((prev) => ({ ...prev, nrc_no: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    try {
      const fullNrc = `${nrc.nrcCode}/${nrc.nrcTownship}(${nrc.nrcType})${nrc.nrcNumber}`;
      const submissionData = { ...formData, nrc_no: fullNrc };

      const response = await studentApi.create(submissionData);

      if (response.data.success) {
        setSuccess("Student created successfully!");
        setTimeout(() => navigate("/dashboard/studentList"), 2000);
      } else {
        setError(response.data.message || "Failed to create student");
      }
    } catch (error) {
      console.error("Student creation error:", error);
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        setError(error.response.data.message || "Validation failed.");
      } else {
        setError("Failed to create student. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          新しい学生作成
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard/studentList")}
          disabled={loading}
        >
          戻る
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {success && <Alert severity="success">{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* School Dropdown */}
          <FormControl fullWidth margin="normal">
            <InputLabel>学校</InputLabel>
            <Select
              name="school_id"
              label="school"
              value={formData.school_id}
              onChange={handleChange}
              error={!!fieldErrors.school_id}
            >
              {schools.map((school) => (
                <MenuItem key={school.id} value={school.id}>
                  {school.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="ロール番号"
            value={formData.roll_no}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.roll_no}
            helperText={fieldErrors.roll_no}
          />
          <FormControl fullWidth error={!!fieldErrors.branch}>
            <InputLabel id="branch-label">Branch</InputLabel>
            <Select
              labelId="branch-label"
              name="branch"
              value={formData.branch}
              label="Branch"
              onChange={handleChange}
              required
            >
              <MenuItem value="mdy">Mandalay</MenuItem>
              <MenuItem value="ygn">Yangon</MenuItem>
            </Select>
            {fieldErrors.branch && (
              <Typography color="error" variant="caption">
                {fieldErrors.branch}
              </Typography>
            )}
          </FormControl>
          <TextField
            fullWidth
            label="名前"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
          />

          <TextField
            fullWidth
            label="メールアドレス"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />

          <FormControl fullWidth margin="normal" error={!!fieldErrors.nrc_no}>
            <Box sx={{ display: "flex", gap: 3 }}>
              <FormControl className="w-[13%]">
                <InputLabel>Code</InputLabel>
                <Select
                  name="nrcCode"
                  value={nrc.nrcCode}
                  onChange={handleNrcChange}
                  label="Code"
                >
                  {nrcCodes.map((code) => (
                    <MenuItem key={code.id} value={code.name}>
                      {code.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl className="w-[35%]">
                <InputLabel>Township</InputLabel>
                <Select
                  name="nrcTownship"
                  value={nrc.nrcTownship}
                  onChange={handleNrcChange}
                  label="Township"
                >
                  {nrcTownships.map((township) => (
                    <MenuItem key={township.code} value={township.code}>
                      {township.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl className="w-[12%]">
                <InputLabel>Type</InputLabel>
                <Select
                  name="nrcType"
                  value={nrc.nrcType}
                  onChange={handleNrcChange}
                  label="Type"
                >
                  {nrcTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Number"
                name="nrcNumber"
                value={nrc.nrcNumber}
                onChange={handleNrcChange}
                inputProps={{ maxLength: 6 }}
              />
            </Box>
            {fieldErrors.nrc_no && (
              <Typography color="error" variant="caption">
                {fieldErrors.nrc_no[0]}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="電話番号"
            name="phone"
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.phone}
            helperText={fieldErrors.phone}
          />

          <TextField
            fullWidth
            label="専攻"
            name="major"
            value={formData.major}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.major}
            helperText={fieldErrors.major}
          />

          <TextField
            fullWidth
            label="学生年"
            name="year"
            value={formData.year}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.year}
            helperText={fieldErrors.year}
          />

          <TextField
            fullWidth
            label="IQスコア"
            name="iq_score"
            type="number"
            value={formData.iq_score}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.iq_score}
            helperText={fieldErrors.iq_score || "0–100"}
          />

          <Box
            sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#606060",
                minWidth: 100,
              }}
              onClick={() => navigate("/dashboard/studentList")}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: 100 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "学生作成"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
