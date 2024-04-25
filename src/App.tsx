import React, { useState, useEffect } from "react";
import { Layout } from "./Layout";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField, Button } from "@mui/material";
import { QrDialog } from "./components";
import { parseCSV } from "./utils/data"; // Assuming you have exported the function to parse CSV and generate data

type ProviderData = {
  bpp_id: string;
  provider_id: string;
  domain: string;
  provider_name: string;
};

function App() {
  const [theme] = useState<"light" | "dark">("light");
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [selectedProviderName, setSelectedProviderName] = useState<string>("");
  const [selectedBppId, setSelectedBppId] = useState<string>("");
  const [uniqueProviderNames, setUniqueProviderNames] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [data, setData] = useState<ProviderData[]>([]);
  const [showBppIdDomain, setShowBppIdDomain] = useState<boolean>(false);

  useEffect(() => {
    parseCSV()
      .then((parsedData) => {
        setData(parsedData);
        const uniqueNames = [...new Set(parsedData.map((item) => item.provider_name))];
        setUniqueProviderNames(uniqueNames);
      })
      .catch((error) => {
        console.error("Error parsing CSV:", error);
      });
  }, []);

  const bppIdOptions = [...new Set(data
    .filter((item) => item.provider_name === selectedProviderName)
    .map((item) => item.bpp_id))];

  const domainOptions = [...new Set(data
    .filter((item) => item.provider_name === selectedProviderName && item.bpp_id === selectedBppId)
    .map((item) => item.domain))];

  const handleGenerateQR = () => {
    setShowQrDialog(true);
  };

  // Function to get provider_id based on selected options
  const getProviderId = () => {
    const selectedData = data.find(
      (item) =>
        item.provider_name === selectedProviderName &&
        item.bpp_id === selectedBppId &&
        item.domain === selectedDomain
    );
    return selectedData?.provider_id ?? "";
  };

  return (
    <Layout theme={theme}>
      <Container
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          py: 2,
        }}
      >
        <img src={"./ondc_logo.png"} alt="logo" />
        <Typography variant="h4">
          <i>QR Code Generator</i>
        </Typography>
        <Paper
          sx={{
            p: 2,
            maxWidth: 350,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Autocomplete
            freeSolo
            value={selectedProviderName}
            onChange={(event, newValue) => {
              setSelectedProviderName(newValue || "");
              setShowBppIdDomain(true); // Show bpp_id and domain dropdowns when provider name is selected
            }}
            inputValue={selectedProviderName}
            onInputChange={(event, newInputValue) => setSelectedProviderName(newInputValue)}
            options={uniqueProviderNames}
            renderInput={(params) => <TextField {...params} label="Type your Store Name" />}
          />
          {showBppIdDomain && ( // Conditionally render bpp_id and domain dropdowns
            <>
              <FormControl fullWidth sx={{ my: 2 }}>
				<InputLabel id="bpp-id-select-label">BPP ID</InputLabel>
                <Select
                  labelId="bpp-id-select-label"
                  id="bpp-id-select"
                  value={selectedBppId}
                  onChange={(event) => setSelectedBppId(event.target.value as string)}
                >
                  {bppIdOptions.map((bppId) => (
                    <MenuItem key={bppId} value={bppId}>
                      {bppId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ my: 2 }}>
                <InputLabel variant="outlined" id="domain-select-label">Domain</InputLabel>
                <Select
                  labelId="domain-select-label"
                  id="domain-select"
                  value={selectedDomain}
                  onChange={(event) => setSelectedDomain(event.target.value as string)}
                >
                  {domainOptions.map((domain) => (
                    <MenuItem key={domain} value={domain}>
                      {domain}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleGenerateQR}
          >
            Generate QR
          </Button>
        </Paper>
        <QrDialog
          onClose={() => setShowQrDialog(false)}
          open={showQrDialog}
          qrData={JSON.stringify({
            bpp_id: selectedBppId,
            provider_name: selectedProviderName,
            domain: selectedDomain,
            provider_id: getProviderId(),
          })}
        />
      </Container>
    </Layout>
  );
}

export default App;