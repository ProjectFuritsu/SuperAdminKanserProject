import { useEffect, useState } from "react";
import {
  SimpleGrid,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Container,
  Title,
  Stack,
  Modal,
  ActionIcon,
  TextInput,
  Select,
  Box,
  Paper,
  ScrollArea,
  TypographyStylesProvider,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useForm } from "@mantine/form";
import { IconPencil, IconEye } from "@tabler/icons-react";
import SupportGroupsCardButton from "../UI/Cards/supportGroupsCardButton";
import {
  deleteSupportGroup,
  getSupportGroups,
  updateSupportGroup,
} from "../../API/SupportGroupsAPI";
import { getGroupType } from "../../API/Utils/SupportGroupsUtils";
import { notifications } from "@mantine/notifications";

export default function Supportgroups() {
  const [groupData, setGroups] = useState([]);
  const [editOpened, setEditOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [groupTypeOptions, setGroupTypeOptions] = useState([]);
  // 1. Form Initialization (Matching Database Column Names)
  const form = useForm({
    initialValues: {
      group_name: "",
      group_type_code: "",
      founder: "",
      group_started_date: null,
      group_socmed_link: "",
      group_detail: "",
    },
  });

  // 2. Rich Text Editor Logic
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: "",
    onUpdate({ editor }) {
      form.setFieldValue("group_detail", editor.getHTML());
    },
  });

  const fetchGroupData = async () => {
    try {
      // 1. Fetch Groups
      const res = await getSupportGroups();
      if (res && res.data) {
        setGroups(res.data);
      }

      // 2. Fetch Group Types
      const typesRes = await getGroupType();

      // Safety check: Ensure typesRes and typesRes.data are defined and is an array
      if (typesRes && Array.isArray(typesRes.data)) {
        const formattedTypes = typesRes.data.map((t) => ({
          value: String(t.group_type_code),
          label: t.group_type_name,
        }));
        setGroupTypeOptions(formattedTypes);
      } else if (Array.isArray(typesRes)) {
        // If your API returns the array directly without a .data wrapper
        const formattedTypes = typesRes.map((t) => ({
          value: String(t.group_type_code),
          label: t.group_type_name,
        }));
        setGroupTypeOptions(formattedTypes);
      } else {
        console.warn("getGroupType returned unexpected format:", typesRes);
      }
    } catch (error) {
      console.error(`Fetching error:`, error);
    }
  };

  // 3. View Logic
  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setViewOpened(true);
  };

  // 4. Edit Logic
  const handleEdit = (group) => {
    setSelectedId(group.support_group_id);
    form.setValues({
      group_name: group.group_name || "",
      group_type_code: group.group_type_code
        ? String(group.group_type_code)
        : "",
      founder: group.founder || "",
      group_started_date: group.group_started_date
        ? new Date(group.group_started_date)
        : null,
      group_socmed_link: group.group_socmed_link || "",
      group_detail: group.group_detail || "",
    });
    editor?.commands.setContent(group.group_detail || "");
    setEditOpened(true);
  };

  const handleSaveUpdate = async (values) => {
    try {
      await updateSupportGroup(selectedId, values);
      setEditOpened(false);
      fetchGroupData();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = async (groupId) => {
    try {
      // 2. Perform the deletion
      await deleteSupportGroup(groupId);

      // 3. Close the modal
      setViewOpened(false);

      await fetchGroupData();

      // 5. Notify the user (Requires @mantine/notifications)
      notifications.show({
        title: "Success",
        message: "The support group has been deleted.",
        color: "green",
      });
    } catch (error) {
      console.error("Delete failed:", error);

      // 6. Handle Error feedback
      notifications.show({
        title: "Error",
        message: "Failed to delete the group. Please try again.",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, []);

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
        <Group position="apart">
          <Title order={2}>Support Groups</Title>
        </Group>

        <SimpleGrid
          cols={3}
          spacing="lg"
          breakpoints={[
            { maxWidth: "md", cols: 2 },
            { maxWidth: "xs", cols: 1 },
          ]}
        >
          <SupportGroupsCardButton onSuccess={fetchGroupData} />

          {groupData.map((group) => (
            <Card
              key={group.support_group_id}
              shadow="sm"
              p="lg"
              radius="md"
              withBorder
            >
              <Group position="apart" mb="xs">
                <Text weight={600} size="lg">
                  {group.group_name}
                </Text>
                <ActionIcon
                  variant="light"
                  color="blue"
                  onClick={() => handleEdit(group)}
                >
                  <IconPencil size="1.2rem" />
                </ActionIcon>
              </Group>

              <Badge color="blue" variant="light" mb="md">
                {group.group_type?.group_type_name || "General"}
              </Badge>

              <Text size="sm" color="dimmed" mb="xl" lineClamp={2}>
                {group.group_detail?.replace(/<[^>]*>?/gm, "") ||
                  "No description provided."}
              </Text>

              <Button
                variant="outline"
                fullWidth
                lefticon={<IconEye size="1rem" />}
                onClick={() => handleViewDetails(group)}
              >
                View Details
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      {/* --- VIEW MODAL --- */}
      <Modal
        opened={viewOpened}
        onClose={() => setViewOpened(false)}
        title={<Text weight={700}>Group Information</Text>}
        size="lg"
      >
        {selectedGroup && (
          <Stack>
            <Title order={3}>{selectedGroup.group_name}</Title>
            <Group>
              <Badge variant="dot">
                {selectedGroup.group_type?.group_type_name}
              </Badge>
              <Text size="xs" color="dimmed">
                Started: {selectedGroup.group_started_date}
              </Text>
            </Group>

            <Text size="sm">
              <b>Founder:</b> {selectedGroup.founder || "N/A"}
            </Text>

            <Paper withBorder p="md" radius="md" bg="gray.0">
              <TypographyStylesProvider>
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedGroup.group_detail,
                  }}
                />
              </TypographyStylesProvider>
            </Paper>

            {/* --- Action Section --- */}
            <Group position="right" mt="xl">
              <Button variant="outline" onClick={() => setViewOpened(false)}>
                Cancel
              </Button>
              <Button
                color="red"
                onClick={() => handleDelete(selectedGroup.support_group_id)}
              >
                Delete Group
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* --- EDIT MODAL --- */}
      <Modal
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        title="Edit Support Group"
        size="xl"
      >
        <ScrollArea h={400} type="hover" offsetScrollbars>
          <Stack spacing="md" pr="md">
            <Badge size="lg" variant="filled" radius="sm">
              Update Details
            </Badge>

            <SimpleGrid cols={2} spacing="sm">
              <TextInput
                label="Group Name"
                {...form.getInputProps("group_name")}
              />
              <Select
                label="Group Type"
                data={groupTypeOptions} // Use the new state here
                {...form.getInputProps("group_type_code")}
              />
              <TextInput label="Founder" {...form.getInputProps("founder")} />
              <DateInput
                label="Started"
                {...form.getInputProps("group_started_date")}
              />
            </SimpleGrid>

            <TextInput
              label="Social Link"
              {...form.getInputProps("group_socmed_link")}
            />

            <Box>
              <Text fw={500} size="sm" mb={4}>
                Mission & Details
              </Text>
              <Paper withBorder radius="md" sx={{ overflow: "hidden" }}>
                <RichTextEditor editor={editor}>
                  <RichTextEditor.Toolbar>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Bold />
                      <RichTextEditor.BulletList />
                    </RichTextEditor.ControlsGroup>
                  </RichTextEditor.Toolbar>
                  <RichTextEditor.Content style={{ minHeight: 150 }} />
                </RichTextEditor>
              </Paper>
            </Box>
          </Stack>
        </ScrollArea>
        <Button
          fullWidth
          mt="xl"
          size="md"
          onClick={() => handleSaveUpdate(form.values)}
        >
          Save Changes
        </Button>
      </Modal>
    </Container>
  );
}
