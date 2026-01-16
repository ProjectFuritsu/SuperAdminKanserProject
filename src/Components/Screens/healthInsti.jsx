import {
  Input,
  SimpleGrid,
  Flex,
  Group,
  Select,
  Button,
  Center,
  Loader,
  Pagination,
  ActionIcon,
  Stack,
  Card,
  Badge,
  Divider,
  Text,
  Accordion,
  ThemeIcon,
  Menu,
  Box,
  Timeline,
  ScrollArea,
} from "@mantine/core";
import {
  IconBook,
  IconCheck,
  IconChevronRight,
  IconDots,
  IconDotsVertical,
  IconEdit,
  IconGift,
  IconMapPin,
  IconMapPin2,
  IconMapPins,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSquareHalf,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { HealthInstiAddCardButton } from "../indexUI.jsx";
import { useEffect, useState } from "react";
import {
  deleteContactDetails,
  deletehealthInsti,
  deleteHealthService,
  fetchHealthInstitution,
  updatehealthInsti,
} from "../../API/healthInstiAPI";
import { Split } from "@gfazioli/mantine-split-pane";
import { Paper, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  fetchbrgy,
  fetchcities,
  fetchprovince,
} from "../../Services/getgeoData.js";
import UpdateServiceModal from "../UI/Modals/UpdateServiceModal.jsx";
import HealthInstiContactModal from "../UI/Modals/HealthInstiContactModal.jsx";
import DescriptionModal from "../UI/Modals/DescriptionModal.jsx";

const ITEMS_PER_PAGE = 9;

export default function HealthInsti() {
  const [instiData, setInstiData] = useState([]);
  const [activePage, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInsti, setSelectedInsti] = useState(null);

  const [serviceModalOpened, setServiceModalOpened] = useState(false);
  const [contactModalOpened, setContactModalOpened] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  const [descriptionmodalOpened, setdescriptionModalOpened] = useState(false);

  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineForm, setInlineForm] = useState({}); // To hold temporary changes

  const [city, setcity] = useState([]);
  const [brgy, setbrgy] = useState([]);
  const [province, setprovince] = useState([]);

  const fetchgeodata = async () => {
    const cdata = await fetchcities();
    const transformedCities =
      cdata?.map((c) => ({
        value: String(c.city_zip_code),
        label: c.city_name,
      })) || [];
    setcity(transformedCities);

    const bdata = await fetchbrgy();
    const transformedBrgy =
      bdata?.map((b) => ({
        value: String(b.brgy_code),
        label: b.brgy_name,
      })) || [];
    setbrgy(transformedBrgy);

    const prdata = await fetchprovince();
    const transformedprov = prdata?.map((pr) => ({
      value: String(pr.province_code),
      label: pr.province_name,
    }));
    setprovince(transformedprov);
  };

  const LoadInstitution = async () => {
    // 1. Ensure we start fresh
    setLoading(true);

    try {
      const from = (activePage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const response = await fetchHealthInstitution(from, to);

      // 2. Validate data structure before setting state
      if (response && response.data) {
        console.log(response.data);

        setInstiData(response.data);
        setTotalCount(response.count || 0);
      } else {
        // Handle empty but successful response
        setInstiData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching health institutions:", error);
      // Optional: Set an error state here to show a "Try Again" button
    } finally {
      await fetchgeodata();
      setLoading(false);
    }
  };

  const handleSelect = (insti) => {
    console.log(insti);

    setSelectedInsti(insti);
    setShowDetails(true);
  };

  const handleclosesidePanels = () => {
    setShowDetails(false);
    setSelectedInsti(null);
  };

  const deleleinsti = async (id) => {
    try {
      await deletehealthInsti(id);
      await LoadInstitution();
      await handleclosesidePanels();
    } catch (error) {
      console.error("Error during deletion:", error);
      // Show error notification
      notifications.show({
        color: "red",
        title: "Deletion Failed",
        message: "Could not delete this Institution.",
      });
    }
  };

  const handleStartEdit = () => {
    setInlineForm({
      name: selectedInsti.health_insti_name,
      city: selectedInsti.city_zip_code,
      barangay: selectedInsti.brgy_code,
      province: selectedInsti.provincial_code,
    });
    setIsInlineEditing(true);
  };

  const handleSaveInline = async () => {
    try {
      console.log(selectedInsti.health_insti_id);

      // 1️⃣ Update institution info
      await updatehealthInsti(selectedInsti.health_insti_id, {
        health_insti_name: inlineForm.name,
        city_zip_code: inlineForm.city,
        brgy_code: inlineForm.barangay,
        provincial_code: inlineForm.province,
      });

      notifications.show({
        title: "Success",
        message: "Financial Details Information updated successfully",
        color: "green",
      });

      setIsInlineEditing(false);
      await LoadInstitution();
      setShowDetails(false);
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "Error",
        message: "Update failed",
        color: "red",
      });
    }
  };

  // Services
  const handleOpenServiceModal = (service = null) => {
    setSelectedService(service); // null means "Add Mode"
    setServiceModalOpened(true);
    setIsInlineEditing(false);
  };

  const handleServiceSuccess = () => {
    handleclosesidePanels();
    LoadInstitution(); // Refresh the data list
    setInstiData(null);
  };

  const handledeleteservice = async (id) => {
    try {
      await deleteHealthService(id);
      await handleclosesidePanels();
      await LoadInstitution();
      notifications.show({
        color: "red",
        title: "Deletion Successful",
        message: `A health institution service was deleted successfully.`,
      });
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Deletion Failed",
        message: "Could not delete this service.",
      });
    }
  };

  // Contact details
  const handleDeleteContact = async (id) => {
    try {
      await deleteContactDetails(id);
      await handleclosesidePanels();
      await LoadInstitution();
      await setIsInlineEditing(false);
    } catch (error) {
      console.log(`Deletion Error: ${error}`);
    }
  };

  const handlecontactSuccess = () => {
    handleclosesidePanels();
    LoadInstitution(); // Refresh the data list
    setSelectedInsti(null);
    setIsInlineEditing(false);
  };

  // Insitution Description
  const handleSaveDescription = () => {
    handleclosesidePanels();
    LoadInstitution(); // Refresh the data list
    setSelectedInsti(null);
    setIsInlineEditing(false);
  };

  const accordionItems = selectedInsti?.health_insti_services?.map(
    (item, index) => (
      <Accordion.Item
        key={`${item.service_name}-${index}`}
        value={item.service_name}
        sx={{ borderBottom: "1px solid #eee" }}
      >
        <Accordion.Control
          component="div"
          style={{ cursor: "default" }} // Main header doesn't look clickable, but the text/chevron will be
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <ThemeIcon variant="light" size="sm" color="blue" radius="xl">
                <IconBook size={12} />
              </ThemeIcon>
              <Text size="sm" fw={500} style={{ cursor: "pointer" }}>
                {item.service_name}
              </Text>
            </Group>

            <Menu
              shadow="xl"
              width={180}
              position="bottom-end"
              transitionProps={{ transition: "pop" }}
            >
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  radius="md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDots size={18} stroke={1.5} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                <Menu.Label>Program Management</Menu.Label>
                <Menu.Item
                  leftSection={<IconPencil size={14} stroke={1.5} />}
                  onClick={() => handleOpenServiceModal(item)}
                >
                  Edit details
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} stroke={1.5} />}
                  onClick={() => handledeleteservice(item.service_id)}
                >
                  Delete Serrvice
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Accordion.Control>

        <Accordion.Panel>
          <Text
            size="sm"
            c="dimmed"
            pl="lg"
            style={{ borderLeft: "2px solid #eee" }}
          >
            {item.service_desc || "No description provided."}
          </Text>
          <Stack gap="md" py="md">
            {/* Requirements */}
            <Box>
              <Text fw={600} size="sm" mb="xs" c="green">
                Service Requirements
              </Text>
              <Group gap="xs">
                {item.service_requirements?.map((reqItem, index) => (
                  <Badge
                    key={reqItem.req_id || index}
                    variant="light"
                    color="green"
                    leftSection={<IconGift size={12} />}
                  >
                    {reqItem.req_desc}
                  </Badge>
                ))}
              </Group>
            </Box>

            <Divider variant="dashed" />

            {/* Procedures/Steps */}
            <Box>
              <Text fw={600} size="sm" mb="xs" c="blue">
                Application Process
              </Text>
              <Timeline active={-1} bulletSize={20} lineWidth={2}>
                {item.services_procedure?.map((stepsItem, index) => (
                  <Timeline.Item
                    key={stepsItem.procedure_id || index}
                    title={`Step ${index + 1}`}
                  >
                    <Text size="sm">{stepsItem.procedure_desc}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Box>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    )
  );

  useEffect(() => {
    LoadInstitution();
  }, [activePage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <>
      {/* Heading */}
      <Flex h={80} gap="md" align="center" justify="space-between" wrap="wrap">
        <Input
          placeholder="Search health institutions…"
          leftSection={<IconSearch size={16} />}
          w={{ base: "100%", sm: 320 }}
        />

        <Group gap="xs">
          <Select
            placeholder="Type"
            data={["Public", "Private"]}
            clearable
            w={140}
          />
          <Select
            placeholder="Status"
            data={["Active", "Inactive"]}
            clearable
            w={140}
          />
        </Group>
      </Flex>

      <Split>
        {/* Cards and others from the left side of the split */}
        <Split.Pane w={showDetails ? "75%" : "100%"} mih="100%">
          <Paper w="100%">
            {loading ? (
              <Center h={300}>
                <Loader variant="dots" />
              </Center>
            ) : (
              <Stack>
                <Flex
                  gap="md"
                  justify="flex-end"
                  align="center"
                  direction="row"
                  wrap="wrap"
                >
                  <Pagination
                    total={totalPages > 0 ? totalPages : 1}
                    value={activePage} // Mantine uses 'value' for controlled components
                    onChange={setPage}
                  />
                </Flex>
                <SimpleGrid
                  cols={
                    showDetails
                      ? { base: 1, sm: 2, lg: 3 }
                      : { base: 1, sm: 2, lg: 5 }
                  }
                >
                  <HealthInstiAddCardButton
                    title={"Add new health institution"}
                    onSuccess={LoadInstitution}
                  />
                  {instiData.length > 0 ? (
                    instiData.map((insti, index) => (
                      <Card
                        key={index}
                        shadow="xs"
                        padding="lg"
                        radius="md"
                        withBorder
                        className="hover-card" // Add a CSS hover effect if you like
                        style={{ transition: "transform 0.2s ease" }}
                      >
                        <Stack justify="space-between" h="100%" gap="md">
                          <div>
                            <Badge color="blue" variant="light" mb="xs">
                              {insti.cities?.city_name || "Health Facility"}
                            </Badge>

                            <Text
                              fw={700}
                              size="md"
                              lineClamp={2}
                              style={{ height: "2.8rem" }}
                            >
                              {insti.health_insti_name}
                            </Text>

                            <Group gap={5} mt="xs">
                              <IconMapPin size={14} color="gray" />
                              <Text size="xs" c="dimmed" truncate>
                                {insti.barangays?.brgy_name || "Location N/A"}
                              </Text>
                            </Group>
                          </div>

                          <Divider />

                          {/* Intuitive Service Count */}
                          <Group justify="space-between">
                            <Stack gap={0}>
                              <Text size="xs" c="dimmed">
                                Services
                              </Text>
                              <Text fw={600} size="sm">
                                {insti.health_insti_services?.length || 0}{" "}
                                Available
                              </Text>
                            </Stack>

                            <ActionIcon
                              variant="light"
                              color="blue"
                              radius="xl"
                              onClick={() => handleSelect(insti)}
                            >
                              <IconChevronRight size={18} />
                            </ActionIcon>
                          </Group>
                        </Stack>
                      </Card>
                    ))
                  ) : (
                    <></>
                  )}
                </SimpleGrid>
              </Stack>
            )}
          </Paper>
        </Split.Pane>

        {showDetails ? (
          <>
            <Split.Pane w={"100%"} h={"100%"} pl="md">
              <Paper p="md" withBorder h="100%">
                {selectedInsti ? (
                  <>
                    <Flex justify="space-between" align="center" mb="md">
                      <Title order={4}>Institution Details</Title>
                      <Flex justify="end" align="center" gap="sm">
                        {isInlineEditing ? (
                          <>
                            {/* Save Button */}
                            <ActionIcon
                              variant="light"
                              color="green"
                              onClick={handleSaveInline}
                            >
                              <IconCheck size={20} />
                            </ActionIcon>
                            {/* Cancel Button */}
                            <ActionIcon
                              variant="light"
                              color="gray"
                              onClick={() => setIsInlineEditing(false)}
                            >
                              <IconX size={20} />
                            </ActionIcon>
                          </>
                        ) : (
                          <>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={handleStartEdit}
                            >
                              <IconEdit size={20} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() =>
                                deleleinsti(selectedInsti.health_insti_id)
                              }
                            >
                              <IconTrash size={20} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              onClick={() => handleclosesidePanels()}
                            >
                              <IconX size={20} />
                            </ActionIcon>
                          </>
                        )}
                      </Flex>
                    </Flex>

                    <ScrollArea h="100%" offsetScrollbars scrollbarSize={6}>
                      <Stack>
                        {/* Health Insti Name */}
                        {isInlineEditing ? (
                          <Input
                            value={inlineForm.name}
                            onChange={(e) =>
                              setInlineForm({
                                ...inlineForm,
                                name: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <Badge size="lg" variant="filled">
                            {selectedInsti.health_insti_name}
                          </Badge>
                        )}

                        {/* Health Insti Description */}
                        {isInlineEditing ? null : (
                          <Accordion defaultValue="about">
                            <Accordion.Item value="about">
                              <Accordion.Control
                                component="div"
                                style={{
                                  cursor: "default",
                                  padding: "4px 8px",
                                }}
                              >
                                <Group justify="space-between" wrap="nowrap">
                                  <Group gap="xs">
                                    <ThemeIcon
                                      variant="light"
                                      size="sm"
                                      color="blue"
                                      radius="xl"
                                    >
                                      <IconBook size={12} />
                                    </ThemeIcon>
                                    <Text
                                      size="sm"
                                      fw={500}
                                      style={{ cursor: "pointer" }}
                                    >
                                      About {selectedInsti?.health_insti_name}
                                    </Text>
                                  </Group>

                                  <Menu
                                    shadow="xl"
                                    width={180}
                                    position="bottom-end"
                                    transitionProps={{ transition: "pop" }}
                                  >
                                    <Menu.Target>
                                      <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        radius="md"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevents accordion from toggling
                                        }}
                                      >
                                        <IconDots size={18} stroke={1.5} />
                                      </ActionIcon>
                                    </Menu.Target>

                                    <Menu.Dropdown
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Menu.Item
                                        leftSection={
                                          <IconPencil size={14} stroke={1.5} />
                                        }
                                        onClick={() => {
                                          setdescriptionModalOpened(true);
                                        }}
                                      >
                                        Edit details
                                      </Menu.Item>
                                    </Menu.Dropdown>
                                  </Menu>
                                </Group>
                              </Accordion.Control>

                              <Accordion.Panel style={{ paddingTop: "1px" }}>
                                <span
                                  style={{
                                    color: "var(--mantine-color-dimmed)",
                                    display: "block",
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      selectedInsti?.health_insti_desc?.[0]
                                        ?.hospitals_desc_content ||
                                      "No description available.",
                                  }}
                                />
                              </Accordion.Panel>
                            </Accordion.Item>
                          </Accordion>
                        )}

                        <Divider
                          label="Location Information"
                          labelPosition="center"
                        />

                        {/* Geographic Info */}
                        <Group grow align="flex-start" gap="lg">
                          {isInlineEditing ? (
                            <>
                              <Select
                                label="City"
                                placeholder="Select City"
                                description="Choose the municipality"
                                data={city}
                                value={String(inlineForm.city)}
                                onChange={(val) =>
                                  setInlineForm({ ...inlineForm, city: val })
                                }
                                searchable
                                allowDeselect
                                nothingFoundMessage="No city found"
                              />
                              <Select
                                label="Barangay"
                                placeholder="Select Barangay"
                                description="Choose the local district"
                                data={brgy}
                                value={String(inlineForm.barangay)}
                                onChange={(val) =>
                                  setInlineForm({
                                    ...inlineForm,
                                    barangay: val,
                                  })
                                }
                                searchable
                                allowDeselect
                                nothingFoundMessage="No barangay found"
                              />
                              <Select
                                label="Province"
                                placeholder="Select Province"
                                description="Region/Province level"
                                data={province}
                                value={String(inlineForm.province)}
                                onChange={(val) =>
                                  setInlineForm({
                                    ...inlineForm,
                                    province: val,
                                  })
                                }
                                searchable
                                allowDeselect
                                nothingFoundMessage="No province found"
                              />
                            </>
                          ) : (
                            <Stack gap={4}>
                              <Text
                                size="xs"
                                fw={700}
                                c="dimmed"
                                tt="uppercase"
                                lts={1}
                              >
                                Location Details
                              </Text>
                              <Group gap="xs">
                                <ThemeIcon
                                  variant="light"
                                  color="blue"
                                  size="sm"
                                  radius="xl"
                                >
                                  <IconMapPin2 size={12} />
                                </ThemeIcon>
                                <Text size="sm" fw={500}>
                                  {selectedInsti.barangays?.brgy_name},{" "}
                                  {selectedInsti.cities?.city_name},{" "}
                                  {selectedInsti.provinces?.province_name}
                                </Text>
                              </Group>
                              <Group gap="xs">
                                <ThemeIcon
                                  variant="light"
                                  color="blue"
                                  size="sm"
                                  radius="xl"
                                >
                                  <IconMapPins size={12} />
                                </ThemeIcon>
                                <Text size="sm" fw={500}>
                                  Lat: {selectedInsti.geo_latitude}, Long:{" "}
                                  {selectedInsti.geo_longhitude}
                                </Text>
                              </Group>
                            </Stack>
                          )}
                        </Group>

                        <Divider
                          label="Contact Details"
                          labelPosition="center"
                        />

                        <Stack w="100%" gap="sm">
                          {selectedInsti.health_insti_contacts.map(
                            (contact, index) => (
                              <Group
                                key={contact.contact_details_id || index}
                                grow
                                p="sm"
                                sx={{
                                  border: "1px solid #eee",
                                  borderRadius: 8,
                                }}
                              >
                                <Text fw={500}>{contact.contact_type}</Text>
                                <Text>{contact.contact_detail}</Text>

                                {isInlineEditing && (
                                  <Menu position="bottom-end" withinPortal>
                                    <Menu.Target>
                                      <ActionIcon variant="subtle">
                                        <IconDotsVertical size={16} />
                                      </ActionIcon>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                      <Menu.Item
                                        leftSection={<IconEdit size={14} />}
                                        onClick={() => {
                                          setSelectedContact(contact);
                                          setContactModalOpened(true);
                                        }}
                                      >
                                        Edit
                                      </Menu.Item>

                                      <Menu.Item
                                        color="red"
                                        leftSection={<IconTrash size={14} />}
                                        onClick={() => {
                                          handleDeleteContact(
                                            contact.contact_id
                                          );
                                        }}
                                      >
                                        Delete
                                      </Menu.Item>
                                    </Menu.Dropdown>
                                  </Menu>
                                )}
                              </Group>
                            )
                          )}
                        </Stack>

                        <Divider label="Services" labelPosition="center" />

                        <Stack>
                          {/* Programs and benefits Information */}
                          {isInlineEditing ? (
                            <Group justify="center" mb="sm" align="center">
                              <Button
                                leftSection={<IconPlus size={16} />}
                                variant="light"
                                color="blue"
                                onClick={() => handleOpenServiceModal(null)}
                              >
                                Add New Service
                              </Button>
                            </Group>
                          ) : null}
                          <Accordion>{accordionItems}</Accordion>
                        </Stack>
                      </Stack>
                    </ScrollArea>
                  </>
                ) : (
                  <Center h={200}>
                    <Text c="dimmed">Please select a card to view details</Text>
                  </Center>
                )}
              </Paper>
            </Split.Pane>
          </>
        ) : (
          <></>
        )}
      </Split>

      {/* Update Modals */}
      <UpdateServiceModal
        opened={serviceModalOpened}
        onClose={() => setServiceModalOpened(false)}
        data={selectedService}
        institutionId={selectedInsti?.health_insti_id}
        onSuccess={handleServiceSuccess}
      />

      <HealthInstiContactModal
        opened={contactModalOpened}
        onClose={() => setContactModalOpened(false)}
        contact={selectedContact}
        onSave={handlecontactSuccess}
        health_insti_ID={selectedInsti?.health_insti_id}
      />

      <DescriptionModal
        opened={descriptionmodalOpened}
        onClose={() => setdescriptionModalOpened(false)}
        onSave={handleSaveDescription}
        instiId={selectedInsti?.health_insti_id}
        initialDescription={
          selectedInsti?.health_insti_desc?.[0]?.hospitals_desc_content
        }
        mode="health"
        maxLength={500} // Optional custom limit
      />
    </>
  );
}
