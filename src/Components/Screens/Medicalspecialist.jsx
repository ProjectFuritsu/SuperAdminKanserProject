import {
  Accordion,
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import MedicalspecialistCardButon from "../UI/Cards/medicalspecialistCardButon";
import { useEffect, useState } from "react";
import {
  deleteMedicalSpecialist,
  fetchMedicalSpecialistInfo,
} from "../../API/medicalspecialistAPI";
import { IconSearch } from "@tabler/icons-react";
import MedicalSpecialistCard from "../UI/Cards/UICard/MedicalSpecialistCard";
import EditspecialistForm from "../UI/Modals/EditspecialistForm";

export default function Medicalspecialist() {
  const [MSData, setMSData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  // This derived state handles the filtering logic automatically
  const filteredData = MSData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());


    return matchesSearch;
  });

  const loadData = async () => {
    try {
      const responsedata = await fetchMedicalSpecialistInfo();
      setMSData(responsedata);
    } catch (error) {
      console.error("Error fetching Data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openSpecialistModal = (mdata) => {
    const specs = mdata.specialized ? JSON.parse(mdata.specialized) : [];
    const cleanDescription = mdata.description
      ? mdata.description.replace(/<[^>]*>?/gm, "")
      : "";

    modals.open({
      title: <Text fw={700}>Medical Specialist Profile</Text>,
      centered: true,
      size: "md",
      radius: "md",
      children: (
        <Stack gap="md">
          {/* Header Section */}
          <Group align="center" wrap="nowrap">
            <Avatar
              src={mdata.image}
              size="xl"
              radius="xl"
              color="blue"
              variant="light"
            >
              {mdata.name.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text fw={800} size="xl" lh={1.1} c="blue.9">
                {mdata.name}
              </Text>
              <Text c="dimmed" size="sm" fw={500} mt={3}>
                {mdata.suffixes}
              </Text>
            </div>
          </Group>

          {/* Bio Section */}
          {cleanDescription && (
            <Paper
              withBorder
              p="xs"
              radius="md"
              bg="gray.0"
              style={{ borderStyle: "dashed" }}
            >
              <Text size="sm" c="gray.7" lh={1.6} ta="center">
                "{cleanDescription}"
              </Text>
            </Paper>
          )}

          {/* Expertise Grid */}
          <Box>
            <Divider label="Expertise" labelPosition="left" mb="xs" />
            <SimpleGrid cols={2} spacing="xs">
              {specs.map((spec, i) => (
                <Group key={i} gap={6} wrap="nowrap">
                  <ThemeIcon size={14} radius="xl" color="blue" variant="light">
                    <Text size="10px">✓</Text>
                  </ThemeIcon>
                  <Text size="xs" fw={500} tt="capitalize">
                    {spec}
                  </Text>
                </Group>
              ))}
            </SimpleGrid>
          </Box>

          {/* Clinics Accordion */}
          <Box>
            <Divider
              label="Clinics & Availability"
              labelPosition="left"
              mb="sm"
            />
            <Accordion variant="separated" radius="md">
              {mdata.medical_specialist_health_institution_map?.map(
                (mapItem, idx) => (
                  <Accordion.Item
                    key={idx}
                    value={mapItem.health_insti?.health_insti_name || `${idx}`}
                  >
                    <Accordion.Control icon="🏥">
                      <Text size="sm" fw={700}>
                        {mapItem.health_insti?.health_insti_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        📍 {mapItem.location}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs">
                        {mapItem.schedule_medical_specialist_map?.map(
                          (s, sIdx) => (
                            <Paper
                              key={sIdx}
                              withBorder
                              p="xs"
                              radius="sm"
                              bg="gray.0"
                            >
                              <Group justify="space-between" wrap="nowrap">
                                <Text size="sm" fw={600}>
                                  {s.schedday}
                                </Text>
                                <Text size="sm" fw={700} c="blue.8">
                                  {s.schedopen} - {s.schedclose}
                                </Text>
                              </Group>
                            </Paper>
                          )
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                )
              )}
            </Accordion>
          </Box>

          {/* Footer Actions */}
          <Divider />
          <Group grow gap="sm">
            <Button
              variant="light"
              leftSection="✏️"
              onClick={() => {
                // 1. Close the current "View Profile" modal to prevent stacking clutter
                modals.closeAll();

                // 2. Open the Edit modal
                modals.open({
                  title: (
                    <Text fw={700} size="lg">
                      Edit Specialist Profile: {mdata.name}
                    </Text>
                  ),
                  size: "xl",
                  radius: "md",
                  children: (
                    <EditspecialistForm
                      mdata={mdata} // Pass the specialist data to the form
                      onCancel={() => modals.closeAll()}
                      onSave={async (finalData) => {
                        try {
                          // Your save logic here (e.g., API call)
                          console.log("Saving updated data:", finalData);

                          // Refresh the main list and close modal
                          await loadData();
                          modals.closeAll();
                        } catch (error) {
                          console.error("Save failed:", error);
                        }
                      }}
                    />
                  ),
                });
              }}
            >
              Edit Profile
            </Button>

            <Button
              variant="outline"
              color="red"
              leftSection="🗑️"
              onClick={() => {
                modals.openConfirmModal({
                  title: "Delete Specialist Profile",
                  centered: true,
                  children: (
                    <Stack gap="xs">
                      <Text size="sm">
                        Are you sure you want to delete <b>{mdata.name}</b>?
                      </Text>
                      <Text size="xs" c="red" fw={500}>
                        This action is permanent and will remove all associated
                        schedules and clinic data.
                      </Text>
                    </Stack>
                  ),
                  labels: {
                    confirm: "Delete Permanently",
                    cancel: "No, Keep Profile",
                  },
                  confirmProps: { color: "red" },
                  onConfirm: async () => {
                    try {
                      // 1. Call your API function
                      await deleteMedicalSpecialist(mdata.msid);

                      // 2. Close all modals once successful
                      modals.closeAll();

                      // 3. Refresh the card list on the main page
                      await loadData();

                      // Optional: Add a success notification here if you use @mantine/notifications
                    } catch (error) {
                      console.error("Error deleting specialist:", error);
                      // Optional: Show error notification to the user
                    }
                  },
                });
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      ),
    });
  };

  return (
    <>
      <Stack mb="xl">
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <TextInput
              placeholder="Search by specialist name..."
              leftSection={<IconSearch size={16} />} // Optional: if using tabler-icons
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Filter by Department"
              data={["All", "Cardiology", "Pediatrics", "Neurology"]}
              value={filterType}
              onChange={(value) => setFilterType(value || "All")}
            />
          </Grid.Col>
        </Grid>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }}>
          <MedicalspecialistCardButon onSuccess={() => loadData()} />

          {filteredData.map((mdata) => (
            <MedicalSpecialistCard
              key={mdata.msid}
              data={mdata}
              onViewDetails={() => openSpecialistModal(mdata)}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </>
  );
}
