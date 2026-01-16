import {
  Input,
  SimpleGrid,
  Flex,
  Group,
  Select,
  Card,
  Paper,
  Stack,
  Center,
  Text,
  Badge,
  Loader,
  Divider,
  ActionIcon,
  Title,
  Pagination,
  Accordion,
  Button,
  Menu,
  ThemeIcon,
  Box,
  Timeline,
  List,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronRight,
  IconEdit,
  IconPin,
  IconSearch,
  IconTrash,
  IconX,
  IconDots,
  IconPencil,
  IconDotsVertical,
  IconBook,
  IconCircleCheck,
  IconGift,
  IconPlus,
  IconMapPin2,
  IconMapPins,
} from "@tabler/icons-react";
import FinancialInstiCardButton from "../UI/Cards/FinancialInstiCardButton";
import { useEffect, useState } from "react";
import {
  deletefinancialInsti,
  fetchFinancialInstitution,
  updatefinancialInsti,
  deleteProgram,
  deletecontactdetail,
} from "../../API/financialInstiAPI";

import { Split } from "@gfazioli/mantine-split-pane";
import { notifications } from "@mantine/notifications";
import {
  fetchbrgy,
  fetchcities,
  fetchprovince,
} from "../../Services/getgeoData";
import UpdateProgramModal from "../UI/Modals/UpdateProgramModal";
import FinancialInstiContactModal from "../UI/Modals/FinancialInstiContactModal";
import DescriptionModal from "../UI/Modals/DescriptionModal";

const ITEMS_PER_PAGE = 9;

export default function financialInsti() {
  const [instiData, setInstiData] = useState([]);
  const [activePage, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInsti, setSelectedInsti] = useState(null);

  const [programModalOpened, setProgramModalOpened] = useState(false);
  const [contactModalOpened, setContactModalOpened] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineForm, setInlineForm] = useState({}); // To hold temporary changes

  const [descriptionmodalOpened, setdescriptionModalOpened] = useState(false);

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

      const response = await fetchFinancialInstitution(from, to);

      if (response && response.data) {
        setInstiData(response.data);
        setTotalCount(response.count || 0);
      } else {
        // Handle empty but successful response
        setInstiData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching financial institutions:", error);
    } finally {
      await fetchgeodata();
      setLoading(false);
    }
  };

  const handleSelectInsti = (insti) => {
    setSelectedInsti(insti);

    setShowDetails(true);
  };

  const handleclosesidePanels = () => {
    setShowDetails(false);
    setSelectedInsti(null);
  };

  const handleStartEditInsti = () => {
    setInlineForm({
      name: selectedInsti.financial_insti_name,
      city: selectedInsti.city_zip_code,
      barangay: selectedInsti.brgy_code,
      province: selectedInsti.province_code,
    });
    setIsInlineEditing(true);
  };

  const handleSaveUpdatedInfo = async () => {
    try {
      // 1️⃣ Update institution info
      await updatefinancialInsti(selectedInsti.financial_insti_id, {
        financial_insti_name: inlineForm.name,
        city_zip_code: inlineForm.city,
        brgy_code: inlineForm.barangay,
        province_code: inlineForm.province,
        purok_code: selectedInsti.purok_code,
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
      notifications.show({
        title: "Error",
        message: "Update failed",
        color: "red",
      });
    }
  };

  const deleteInsti = async (id) => {
    try {
      await deletefinancialInsti(id);
      await handleclosesidePanels();
      await LoadInstitution();
      notifications.show({
        color: "red",
        title: "Deletion Successful",
        message: `Insitution ID: ${id} was deleted.`,
      });
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Deletion Failed",
        message: "Could not delete this Institution.",
      });
    }
  };

  // Program
  const handledeleteprogram = async (id) => {
    try {
      await deleteProgram(id);
      await handleclosesidePanels();
      await LoadInstitution();
      notifications.show({
        color: "red",
        title: "Deletion Successful",
        message: `A financial institution program was deleted successfully.`,
      });
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Deletion Failed",
        message: "Could not delete this Institution.",
      });
    }
  };

  const handleOpenProgramModal = (program = null) => {
    setSelectedProgram(program); // null means "Add Mode"
    setProgramModalOpened(true);
    setIsInlineEditing(false);
  };

  const handleProgramSuccess = () => {
    handleclosesidePanels();
    LoadInstitution(); // Refresh the data list
    setInstiData(null);
  };

  // Contact Details
  const handleDeleteContact = async (id) => {
    try {
      await deletecontactdetail(id);
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

  // Description
  const handleSaveDescription = () => {
    handleclosesidePanels();
    LoadInstitution(); // Refresh the data list
    setSelectedInsti(null);
    setIsInlineEditing(false);
  };

  const accordionitems = selectedInsti?.program_offers?.map((item, index) => (
    <Accordion.Item
      key={`${item.program_name}-${index}`}
      value={item.program_name}
      sx={{ borderBottom: "1px solid #eee" }}
    >
      <Accordion.Control
        component="div"
        style={{ cursor: "default" }} // Main header doesn't look clickable, but the text/chevron will be
      >
        <Group justify="space-between" wrap="nowrap">
          {/* 1. Left Side: Title and a small indicator icon */}
          <Group gap="sm">
            <ThemeIcon variant="light" size="sm" color="blue" radius="xl">
              <IconBook size={12} />
            </ThemeIcon>
            <Text size="sm" fw={500} style={{ cursor: "pointer" }}>
              {item.program_name}
            </Text>
          </Group>

          {/* 2. Right Side: The Menu */}
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
                onClick={() => handleOpenProgramModal(item)}
              >
                Edit details
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} stroke={1.5} />}
                onClick={() => handledeleteprogram(item.program_id)}
              >
                Delete program
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
          {item.program_desc || "No description provided."}
        </Text>

        <Stack gap="md" py="md">
          {/* Benefits */}
          <Box>
            <Text fw={600} size="sm" mb="xs" c="green">
              Program Benefits
            </Text>
            <Group gap="xs">
              {item.program_benefits?.map((benefItem, index) => (
                <Badge
                  key={benefItem.benef_id}
                  variant="light"
                  color="green"
                  leftSection={<IconGift size={12} />}
                >
                  {benefItem.benef_desc}
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
              {item.program_offer_steps?.map((stepsItem, index) => (
                <Timeline.Item key={index} title={`Step ${index + 1}`}>
                  <Text size="sm">{stepsItem.program_steps_desc}</Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Box>

          <Divider variant="dashed" />

          {/* Requirements */}
          <Box>
            <Text fw={600} size="sm" mb="xs" c="orange">
              Requirements
            </Text>
            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="orange" size={20} radius="xl">
                  <IconCircleCheck size={12} />
                </ThemeIcon>
              }
            >
              {item.program_requirements?.map((reqItem, index) => (
                <List.Item key={reqItem.program_req_id || index}>
                  {reqItem.req_details}
                </List.Item>
              ))}
            </List>
          </Box>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  useEffect(() => {
    const load = async () => {
      await LoadInstitution();
    };

    load();
  }, [activePage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <>
      <Flex h={80} gap="md" align="center" justify="space-between" wrap="wrap">
        {/* Left: Search */}
        <Input
          placeholder="Search financial institutions…"
          leftSection={<IconSearch size={16} />}
          w={{ base: "100%", sm: 320 }}
        />

        {/* Right: Filters */}
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
                  spacing="xl"
                >
                  <FinancialInstiCardButton
                    title={"Insertion of New Financial Institution"}
                    onsuccess={LoadInstitution}
                    SelectedData={selectedInsti}
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
                              {insti.financial_insti_name}
                            </Text>

                            <Group gap={5} mt="xs">
                              <IconPin size={14} color="gray" />
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
                                {insti.program_offers?.length || 0} Available
                              </Text>
                            </Stack>

                            <ActionIcon
                              variant="light"
                              color="blue"
                              radius="xl"
                              onClick={() => handleSelectInsti(insti)}
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
          <Split.Pane w={"100%"} h={"100%"} pl="md">
            {/* 1. Set Paper radius to 0 and remove border if you want it to look integrated */}
            <Paper p="md" h="100%" radius={0} withBorder={true}>
              {/* 2. Reduced mb (margin-bottom) to bring details closer to header */}
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
                            onClick={handleSaveUpdatedInfo}
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
                            onClick={handleStartEditInsti}
                          >
                            <IconEdit size={20} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() =>
                              deleteInsti(selectedInsti.financial_insti_id)
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

                  <Stack gap="md">
                    {/* Institution Name */}
                    {isInlineEditing ? (
                      <Input
                        value={inlineForm.name}
                        onChange={(e) =>
                          setInlineForm({ ...inlineForm, name: e.target.value })
                        }
                      />
                    ) : (
                      <Badge size="lg" variant="filled">
                        {selectedInsti.financial_insti_name}
                      </Badge>
                    )}

                    {/* Institution Description */}
                    {isInlineEditing ? null : (
                      <Accordion defaultValue="about">
                        <Accordion.Item value="about">
                          <Accordion.Control
                            component="div"
                            style={{ cursor: "default", padding: "4px 8px" }}
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
                                  About {selectedInsti?.financial_insti_name}
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
                                  selectedInsti?.financial_insti_desc ||
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

                    {/* Geographic Information */}
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
                              setInlineForm({ ...inlineForm, barangay: val })
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
                              setInlineForm({ ...inlineForm, province: val })
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
                              Lat: {selectedInsti.geo_latitutde}, Long:{" "}
                              {selectedInsti.geo_longhitude}
                            </Text>
                          </Group>
                        </Stack>
                      )}
                    </Group>

                    <Divider label="Contact Details" labelPosition="center" />

                    {/* Contact Details Information */}
                    <Stack w="100%" gap="sm">
                      {selectedInsti.financial_contact_details.map(
                        (contact, index) => (
                          <Group
                            key={contact.contact_details_id || index}
                            grow
                            p="sm"
                            sx={{ border: "1px solid #eee", borderRadius: 8 }}
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
                                        contact.contact_details_id
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

                      {isInlineEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          lefticon={<IconPlus size={14} />}
                          onClick={() => {
                            setSelectedContact(null);
                            setContactModalOpened(true);
                          }}
                        >
                          Add Contact Details
                        </Button>
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
                            onClick={() => handleOpenProgramModal(null)}
                          >
                            Add New Program
                          </Button>
                        </Group>
                      ) : (
                        <></>
                      )}
                      <Accordion>{accordionitems}</Accordion>
                    </Stack>
                  </Stack>
                </>
              ) : (
                <Center h={200}>
                  <Text c="dimmed">Please select a card to view details</Text>
                </Center>
              )}
            </Paper>
          </Split.Pane>
        ) : null}
      </Split>

      {/* Update Modal */}
      <UpdateProgramModal
        opened={programModalOpened}
        onClose={() => setProgramModalOpened(false)}
        data={selectedProgram}
        institutionId={selectedInsti?.financial_insti_id}
        onSuccess={handleProgramSuccess}
      />

      <FinancialInstiContactModal
        opened={contactModalOpened}
        onClose={() => setContactModalOpened(false)}
        contact={selectedContact}
        onSave={handlecontactSuccess}
        financial_insti_ID={selectedInsti?.financial_insti_id}
      />

      <DescriptionModal
        opened={descriptionmodalOpened}
        onClose={() => setdescriptionModalOpened(false)}
        onSave={handleSaveDescription}
        instiId={selectedInsti?.financial_insti_id}
        initialDescription={selectedInsti?.financial_insti_desc}
        mode="financial"
        maxLength={500} // Optional custom limit
      />
    </>
  );
}
