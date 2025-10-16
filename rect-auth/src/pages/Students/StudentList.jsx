import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  TablePagination,
  InputAdornment,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  School,
  CheckCircle,
  Cancel,
  FileUpload,
  FileDownload,
} from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
import { useAuth } from "../../contexts/AuthContext";
import { studentApi, schoolApi } from "../../services/ApiService";
import { useNavigate } from "react-router-dom";
import { nrcCodes, nrcTownships, nrcTypes } from "../../constants/nrcConstants";

export default function StudentList() {
  const navigate = useNavigate();
  const { canManageStudents } = useAuth();

  // State management
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrorDialogOpen, setImportErrorDialogOpen] = useState(false);
  const [importErrors, setImportErrors] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    school_id: "",
    roll_no: "",
    branch: "",
    name: "",
    email: "",
    nrc_no: "",
    phone: "",
    major: "",
    year: "",
    iq_score: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [nrc, setNrc] = useState({
    nrcCode: "",
    nrcTownship: "",
    nrcType: "",
    nrcNumber: "",
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getAll();
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      showSnackbar("Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await schoolApi.getAll();
      if (response.data.success) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Dialog handlers
  const handleOpenDialog = (student) => {
    setEditingStudent(student);

    // Parse NRC
    const nrcString = student.nrc_no || "";
    const nrcRegex = /^(\d{1,2})\/([A-Za-z]+)\(([NPET])\)(\d{6})$/;
    const match = nrcString.match(nrcRegex);

    if (match) {
      setNrc({
        nrcCode: match[1],
        nrcTownship: match[2],
        nrcType: match[3],
        nrcNumber: match[4],
      });
    } else {
      // Reset if NRC is not in the expected format or is empty
      setNrc({
        nrcCode: "",
        nrcTownship: "",
        nrcType: "",
        nrcNumber: "",
      });
    }

    // Set other form data, excluding nrc_no
    setFormData({
      school_id: student.school_id || "",
      roll_no: student.roll_no || "",
      branch: student.branch || "",
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      major: student.major || "",
      year: student.year || "",
      iq_score: student.iq_score || "",
    });

    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
    setFormData({
      school_id: "",
      roll_no: "",
      branch: "",
      name: "",
      email: "",
      nrc_no: "",
      phone: "",
      major: "",
      year: "",
      iq_score: "",
    });
    setFormErrors({});
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
  };

  const handleNrcChange = (e) => {
    const { name, value } = e.target;
    setNrc((prev) => ({ ...prev, [name]: value }));
    if (formErrors.nrc_no) {
      setFormErrors((prev) => ({ ...prev, nrc_no: "" }));
    }
  };

  const handleSubmit = async () => {
    setFormErrors({});

    try {
      const fullNrc = `${nrc.nrcCode}/${nrc.nrcTownship}(${nrc.nrcType})${nrc.nrcNumber}`;
      const submissionData = { ...formData, nrc_no: fullNrc };

      await studentApi.update(editingStudent.id, submissionData);
      showSnackbar("学生の更新に成功しました。");
      fetchStudents();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving student:", error);

      // Handle Laravel validation errors
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        showSnackbar("フォームのエラーを修正してください。", "error");
      } else {
        const errorMessage =
          error.response?.data?.message || "Failed to save student";
        showSnackbar(errorMessage, "error");
      }
    }
  };

  // Delete handlers
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteConfirmOpen(true);
  };

  // Import/Export handlers
  const handleExport = async () => {
    try {
      const response = await studentApi.exportStudents();
      if (response.data instanceof Blob) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        const contentDisposition = response.headers["content-disposition"];
        let filename = `students_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        showSnackbar("エクスポートが完了しました", "success");
      } else {
        const errorData = response.data;
        showSnackbar(errorData.message || "Export failed", "error");
      }
    } catch (error) {
      console.error("Export failed:", error);
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          const errorJson = JSON.parse(errorText);
          showSnackbar(
            "エクスポートに失敗しました: " +
              (errorJson.message || "Server error"),
            "error"
          );
        } catch (e) {
          showSnackbar(
            "エクスポートに失敗しました: An unknown error occurred while parsing the error response.",
            "error"
          );
        }
      } else {
        showSnackbar(
          "エクスポートに失敗しました: " +
            (error.response?.data?.message || error.message),
          "error"
        );
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      showSnackbar(
        "無効なファイル形式です。ExcelまたはCSVファイルを選択してください。",
        "error"
      );
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    const formData = new FormData();
    formData.append("file", file);

    setIsImporting(true);
    try {
      const response = await studentApi.importStudents(formData);
      const { data } = response;

      if (data.success && data.skipped_rows?.length > 0) {
        // Partial success with skipped rows
        setImportErrors(data.skipped_rows);
        setImportErrorDialogOpen(true);
        showSnackbar("一部のデータはスキップされました。", "warning");
      } else {
        // Full success
        showSnackbar(data.message, "success");
      }

      fetchStudents(); // Refresh student list
    } catch (error) {
      console.error("Import failed:", error);
      const responseData = error.response?.data;

      if (responseData?.message) {
        // Show backend error (like "Duplicate data occurred!")
        showSnackbar(responseData.message, "error");
      } else {
        showSnackbar(
          "インポートに失敗しました: " + (error.message || "不明なエラー"),
          "error"
        );
      }
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
      e.target.value = "";
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await studentApi.delete(studentToDelete.id);
      showSnackbar("学生は正常に削除されました。");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete student";
      showSnackbar(errorMessage, "error");
    } finally {
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setStudentToDelete(null);
  };

  // State for branch filter
  const [branchFilter, setBranchFilter] = useState("all");

  // Filter students based on search term and branch filter
  const filteredStudents = students.filter(
    (student) =>
      (searchTerm === "" ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.school?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (branchFilter === "all" || student.branch === branchFilter)
  );

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>インターンシップを読み込み中...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Person color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            インターンシップ管理
          </Typography>
        </Box>
        {canManageStudents() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/dashboard/studentCreate")}
            sx={{ minWidth: 140 }}
          >
            追加
          </Button>
        )}
      </Box>

      <Box
        mb={3}
        display="flex"
        gap={2}
        alignItems="center"
        flexWrap="wrap"
        justifyContent="space-between"
      >
        {/* Search */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flex: 1,
            minWidth: 300,
            maxWidth: 600,
          }}
        >
          <TextField
            fullWidth
            placeholder="検索 . . ."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          {/* Branch Filter */}
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="branch-filter-label">ブランチ</InputLabel>
            <Select
              labelId="branch-filter-label"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              label="ブランチ"
            >
              <MenuItem value="all">All Branches</MenuItem>
              <MenuItem value="mdy">Mandalay</MenuItem>
              <MenuItem value="ygn">Yangon</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          {/* Export Button */}
          <Button
            variant="contained"
            color="primary"
            sx={{ marginRight: 2 }}
            startIcon={<FileDownload />}
            onClick={handleExport}
          >
            エクスポート
          </Button>

          {/* Import Button */}
          <Button
            variant="contained"
            component="label"
            color="primary"
            startIcon={
              isImporting ? <CircularProgress size={20} /> : <FileUpload />
            }
            disabled={isImporting}
          >
            {isImporting ? "インポート中..." : "インポート"}
            <input
              type="file"
              hidden
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={isImporting}
            />
          </Button>
        </Box>
      </Box>

      {/* Students Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(92,155,16,0.5)" }}>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>ロール番号</strong>
              </TableCell>
              <TableCell>
                <strong>Branch</strong>
              </TableCell>
              <TableCell>
                <strong>名前</strong>
              </TableCell>
              <TableCell>
                <strong>大学</strong>
              </TableCell>
              <TableCell>
                <strong>専攻</strong>
              </TableCell>
              <TableCell>
                <strong>学生年</strong>
              </TableCell>
              <TableCell>
                <strong>IQスコア</strong>
              </TableCell>
              <TableCell>
                <strong>社会員</strong>
              </TableCell>
              <TableCell>
                <strong>メールアドレス</strong>
              </TableCell>
              {canManageStudents() && (
                <TableCell>
                  <strong>アクション</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManageStudents() ? 11 : 10}
                  align="center"
                >
                  <Typography color="textSecondary" py={4}>
                    {searchTerm
                      ? "No students found matching your search."
                      : "No students available."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student, idx) => {
                const rowNumber = page * rowsPerPage + idx + 1;
                return (
                  <TableRow key={student.id} hover>
                    <TableCell>{rowNumber}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {student.roll_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.branch === "ygn" ? "Yangon" : "Mandalay"}
                        size="small"
                        color={
                          student.branch === "ygn" ? "primary" : "secondary"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<School />}
                        label={student.school?.name || "N/A"}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{student.major}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${student.iq_score}/100`}
                        size="small"
                        color={student.iq_score >= 60 ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell>
                      {student.employee ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Yes"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<Cancel />}
                          label="No"
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    {canManageStudents() && (
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="学生の編集">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(student)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="学生の削除">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(student)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredStudents.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Import Error Dialog */}
      <Dialog
        open={importErrorDialogOpen}
        onClose={() => setImportErrorDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", color: "error.main" }}>
          インポート検証エラー
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small" sx={{ border: "1px solid #e0e0e0" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      border: "1px solid #e0e0e0",
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      textAlign: "center",
                    }}
                  >
                    Row
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #e0e0e0",
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    Error(s)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importErrors.map((error, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{ border: "1px solid #e0e0e0", textAlign: "center" }}
                    >
                      {error.row || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid #e0e0e0", color: "error.main" }}
                    >
                      {error.errors?.join(", ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <DialogActions sx={{ mt: 2 }}>
            <Button
              onClick={() => setImportErrorDialogOpen(false)}
              variant="contained"
            >
              閉じる
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ textAlign: "center", fontSize: 24, fontWeight: "bold", pb: 1 }}
        >
          学生編集
        </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <TextField
              fullWidth
              margin="normal"
              select
              label="大学"
              value={formData.school_id}
              onChange={(e) => handleInputChange("school_id", e.target.value)}
              error={!!formErrors.school_id}
              helperText={formErrors.school_id ? formErrors.school_id[0] : ""}
            >
              <MenuItem value="">Select School</MenuItem>
              {schools.map((school) => (
                <MenuItem key={school.id} value={school.id}>
                  {school.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="ロール番号"
              value={formData.roll_no}
              onChange={(e) => handleInputChange("roll_no", e.target.value)}
              error={!!formErrors.roll_no}
              helperText={formErrors.roll_no ? formErrors.roll_no[0] : ""}
            />
            <FormControl fullWidth margin="normal" error={!!formErrors.branch}>
              <InputLabel id="edit-branch-label">Branch</InputLabel>
              <Select
                labelId="edit-branch-label"
                label="Branch"
                value={formData.branch || "mdy"}
                onChange={(e) => handleInputChange("branch", e.target.value)}
              >
                <MenuItem value="mdy">Mandalay</MenuItem>
                <MenuItem value="ygn">Yangon</MenuItem>
              </Select>
              {formErrors.branch && (
                <Typography color="error" variant="caption">
                  {formErrors.branch[0]}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="名前"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name ? formErrors.name[0] : ""}
            />
            <TextField
              fullWidth
              margin="normal"
              label="メールアドレス"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email ? formErrors.email[0] : ""}
            />
            <FormControl fullWidth margin="normal" error={!!formErrors.nrc_no}>
              <Box sx={{ display: "flex", gap: 3 }}>
                <FormControl className="w-[15%]">
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
                <FormControl className="w-[25%]">
                  <InputLabel>Township</InputLabel>
                  <Select
                    name="nrcTownship"
                    value={nrc.nrcTownship}
                    onChange={handleNrcChange}
                    label="Township"
                  >
                    {nrcTownships.map((township, index) => (
                      <MenuItem
                        key={`${township.code}-${index}`}
                        value={township.code}
                      >
                        {township.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl className="w-[18%]">
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
              {formErrors.nrc_no && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ pl: 2, pt: 1 }}
                >
                  {formErrors.nrc_no[0]}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="電話番号"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              error={!!formErrors.phone}
              helperText={formErrors.phone ? formErrors.phone[0] : ""}
              placeholder="e.g., 09-979789609"
            />
            <TextField
              fullWidth
              margin="normal"
              label="専攻"
              value={formData.major}
              onChange={(e) => handleInputChange("major", e.target.value)}
              error={!!formErrors.major}
              helperText={formErrors.major ? formErrors.major[0] : ""}
              placeholder="e.g., EC, IT, Civil"
            />
            <TextField
              fullWidth
              margin="normal"
              label="学生年"
              value={formData.year}
              onChange={(e) => handleInputChange("year", e.target.value)}
              error={!!formErrors.year}
              helperText={formErrors.year ? formErrors.year[0] : ""}
              placeholder="e.g., First Year, Second Year"
            />
            <TextField
              fullWidth
              margin="normal"
              label="IQスコア"
              type="number"
              value={formData.iq_score}
              onChange={(e) =>
                handleInputChange("iq_score", parseInt(e.target.value) || "")
              }
              error={!!formErrors.iq_score}
              helperText={
                formErrors.iq_score
                  ? formErrors.iq_score[0]
                  : "スコアが60以上の場合、従業員記録が自動的に作成されます。"
              }
              inputProps={{ min: 0, max: 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#606060", minWidth: 100 }}
            onClick={handleCloseDialog}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            更新する
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", py: 2 }}>
          本当に削除しますか？
        </DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <ErrorIcon color="error" sx={{ fontSize: 40 }} />
        </Box>
        <DialogContent>
          <DialogContentText component="div" className="text-center">
            学生『{studentToDelete?.name}』を削除してもよろしいですか？
            <br />
            これにより、関連する従業員および出席記録も削除されます。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, p: 3 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#606060", minWidth: 100 }}
            onClick={handleDeleteCancel}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
