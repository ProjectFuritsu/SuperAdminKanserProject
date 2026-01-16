import { useEffect, useState } from "react";
import {
  Stepper,
  Button,
  Group,
  TextInput,
  Select,
  Container,
  Paper,
  Title,
  Stack,
  SimpleGrid,
  Text,
  Box,
  Flex,
  Card,
  Badge,
  Divider,
  ScrollArea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { RichTextEditor } from "@mantine/tiptap";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  IconBold,
  IconCalendar,
  IconCheck,
  IconLink,
  IconUser,
} from "@tabler/icons-react";
import { getGroupType } from "../../../API/Utils/SupportGroupsUtils";
import { addSupportGroup } from "../../../API/SupportGroupsAPI";
import { notifications } from "@mantine/notifications";
export default function SupportGroupStepper({ onSuccess }) {
  const [active, setActive] = useState(0);

  const [loading, setLoading] = useState(false);
  const [grouptypedata, setGroupTypedata] = useState([]);

  const form = useForm({
    initialValues: {
      groupName: "",
      groupType: "",
      groupDetail: "",
      startDate: null,
      socMedLink: "",
      founderName: "",
    },
    validate: (values) => {
      const errors = {};

      if (active === 0) {
        if (!values.groupName) errors.groupName = "Group name is required";
        if (!values.groupType) errors.groupType = "Please select a type";
        if (
          !values.groupDetail ||
          values.groupDetail.trim().length < 10 ||
          values.groupDetail === "<p></p>"
        )
          errors.groupDetail =
            "Description is too short, Please enter a brief description";
        if (!values.founderName) errors.founderName = "Please select a founder";
        if (!values.startDate)
          errors.startDate = "Please enter the date started";
        if (!values.socMedLink)
          errors.socMedLink = "Please enter a valid social link";
      }

      return errors;
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "This Support group was founded to...",
      }),
    ],
    content: "",
    onUpdate({ editor }) {
      form.setFieldValue("groupDetail", editor.getHTML());
    },
  });

  const nextStep = () => {
    const { hasErrors } = form.validate();
    if (!hasErrors) {
      setActive((current) => (current < 3 ? current + 1 : current));
    }
  };
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const fetchTypeData = async () => {
    try {
      const res = await getGroupType();

      // 1. Check if res exists and is an array
      if (!res || !Array.isArray(res)) {
        console.error("API did not return an array:", res);
        return;
      }

      // 2. Map with optional chaining and fallback values
      const formattedData = res.map((item) => ({
        // Use ?. to prevent "reading property of undefined"
        // Use || "" as a fallback to ensure it's always a string
        value: item?.group_type_code?.toString() || Math.random().toString(),
        label: item?.group_type_name || "Unknown Type",
      }));

      setGroupTypedata(formattedData);
    } catch (error) {
      console.error(`Fetching error: `, error);
    }
  };

  useEffect(() => {
    fetchTypeData();
  }, []);

  // This useEffect runs every time grouptypedata changes
  useEffect(() => {
    console.log("Updated Group Type Data:", grouptypedata);
  }, [grouptypedata]);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // 1. Guard against undefined values before trimming
      const payload = {
        group_name: values.groupName?.trim() || "",
        group_type_code: values.groupType,
        group_detail: values.groupDetail,
        group_started_date: values.startDate
          ? new Date(values.startDate).toISOString().split("T")[0]
          : null,
        group_socmed_link: values.socMedLink?.trim() || "",
        founder: values.founderName?.trim() || "",
      };

      // 2. Perform the API call
      await addSupportGroup(payload);

      onSuccess();
      // 3. User feedback (Crucial!)
      // Assuming you have a toast or notification library
      notifications.show({
        color: "green",
        title: "Submission Success🎊",
        message: "You successuly insert a new support group.",
      });

      form.reset();
      setActive(0);
    } catch (error) {
      // 4. Enhanced Error Handling
      console.error("Failed to submit support group:", error);
      notifications.show({
        color: "red",
        title: "Submission Failed",
        message: "There was an error submitting the data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" style={{ height: "auto", overflow: "hidden" }}>
      <Flex style={{ flex: 1, overflow: "auto", minWidth: "400px" }}>
        <Box
          w={"300px"}
          h={485}
          p="md"
          style={{
            borderRight: "1px solid #e9ecef",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Stepper
            active={active}
            onStepClick={setActive}
            orientation="vertical"
            allowNextStepsSelect={false}
            styles={{
              content: {
                display: "none", // We hide the internal content
              },
              step: {
                marginBottom: "20px",
              },
            }}
          >
            <Stepper.Step label="Identity" description="Comprehensive info" />
            <Stepper.Step label="Review/Submit" description="Final check" />
          </Stepper>
        </Box>

        <Box style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
          {active === 0 && (
            <ScrollArea h={450} type="hover" offsetScrollbars>
              <Stack gap="xs" pr="md">
                <Group position="apart" align="center">
                  <Stack spacing={4}>
                    <Badge size="lg" variant="filled" radius="sm">
                      Step 1 of 2
                    </Badge>

                    <Text weight={700} size="xl" sx={{ lineHeight: 1 }}>
                      Basic Information
                    </Text>

                    <Text size="sm" color="dimmed">
                      Please enter the basic information of the group.
                    </Text>
                  </Stack>
                </Group>
                <SimpleGrid cols={2} spacing="xs">
                  <TextInput
                    label="Group Name"
                    placeholder="Name"
                    withAsterisk
                    size="sm"
                    {...form.getInputProps("groupName")}
                  />
                  <Select
                    label="Group Type"
                    placeholder="Select type"
                    data={grouptypedata}
                    size="sm"
                    {...form.getInputProps("groupType")}
                  />
                  <TextInput
                    label="Founder"
                    placeholder="Full name"
                    size="sm"
                    {...form.getInputProps("founderName")}
                  />
                  <DateInput
                    label="Started"
                    placeholder="Pick date"
                    size="sm"
                    {...form.getInputProps("startDate")}
                  />
                </SimpleGrid>
                <TextInput
                  label="Social Link"
                  placeholder="URL"
                  size="sm"
                  {...form.getInputProps("socMedLink")}
                />

                <Box mt="xs">
                  <Text fw={500} size="sm" mb={4}>
                    Mission & Details
                  </Text>
                  {form.errors.groupDetail && (
                    <Text color="red" size="xs" mt={5}>
                      {form.errors.groupDetail}
                    </Text>
                  )}
                  <Paper withBorder radius="xs" sx={{ overflow: "hidden" }}>
                    <RichTextEditor editor={editor} sx={{ border: 0 }}>
                      {/* Minimal Toolbar for tight spaces */}
                      <RichTextEditor.Toolbar spacing={0}>
                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Bold />
                          <RichTextEditor.BulletList />
                          <RichTextEditor.Link />
                        </RichTextEditor.ControlsGroup>
                      </RichTextEditor.Toolbar>
                      <RichTextEditor.Content
                        style={{
                          minHeight: 120,
                          fontSize: "13px",
                          backgroundColor: "#fff",
                        }}
                      />
                    </RichTextEditor>
                  </Paper>
                </Box>
              </Stack>
            </ScrollArea>
          )}

          {active === 1 && (
            <ScrollArea h={450} type="hover" offsetScrollbars>
              <Stack spacing="xl" p="md">
                {/* Header Section */}
                <Group position="apart" align="center">
                  <Stack spacing={4}>
                    <Badge size="lg" variant="filled" radius="sm">
                      Step 2 of 2
                    </Badge>
                    <Text weight={700} size="xl" sx={{ lineHeight: 1 }}>
                      Preview Details
                    </Text>

                    <Text size="sm" color="dimmed">
                      Please review the information before submitting.
                    </Text>
                  </Stack>
                </Group>

                <Paper withBorder radius="md" p="xl" shadow="sm">
                  <Stack spacing="xl">
                    {/* Top Row: Key Identity Info */}
                    <SimpleGrid
                      cols={2}
                      breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                    >
                      <div>
                        <Text
                          size="xs"
                          color="dimmed"
                          transform="uppercase"
                          weight={700}
                          mb={4}
                        >
                          Group Name
                        </Text>
                        <Text weight={600} size="lg">
                          {form.values.groupName || "Untitled Group"}
                        </Text>
                      </div>
                      <div>
                        <Text
                          size="xs"
                          color="dimmed"
                          transform="uppercase"
                          weight={700}
                          mb={4}
                        >
                          Group Type
                        </Text>
                        <Badge
                          size="lg"
                          radius="sm"
                          variant="light"
                          color="blue"
                        >
                          {form.values.groupType || "Not Specified"}
                        </Badge>
                      </div>
                    </SimpleGrid>

                    <Divider variant="dashed" />

                    {/* Middle Row: Metadata */}
                    <SimpleGrid
                      cols={3}
                      breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                      spacing="lg"
                    >
                      <div>
                        <Text size="xs" color="dimmed" weight={700} mb={2}>
                          Founder
                        </Text>
                        <Text size="sm" weight={500}>
                          {form.values.founderName || "-"}
                        </Text>
                      </div>
                      <div>
                        <Text size="xs" color="dimmed" weight={700} mb={2}>
                          Start Date
                        </Text>
                        <Text size="sm" weight={500}>
                          {form.values.startDate
                            ? new Date(
                                form.values.startDate
                              ).toLocaleDateString(undefined, {
                                dateStyle: "medium",
                              })
                            : "-"}
                        </Text>
                      </div>
                      <div>
                        <Text size="xs" color="dimmed" weight={700} mb={2}>
                          Social Media
                        </Text>
                        {form.values.socMedLink ? (
                          <Text
                            variant="link"
                            component="a"
                            href={form.values.socMedLink}
                            target="_blank"
                            size="sm"
                            weight={500}
                            sx={{
                              cursor: "pointer",
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {form.values.socMedLink}
                          </Text>
                        ) : (
                          <Text size="sm" color="dimmed">
                            -
                          </Text>
                        )}
                      </div>
                    </SimpleGrid>

                    {/* Bottom Row: Rich Text Description */}
                    <Stack spacing={8}>
                      <Text
                        size="xs"
                        color="dimmed"
                        transform="uppercase"
                        weight={700}
                      >
                        Description
                      </Text>
                      <Box
                        sx={(theme) => ({
                          backgroundColor:
                            theme.colorScheme === "dark"
                              ? theme.colors.dark[6]
                              : theme.colors.gray[0],
                          border: `1px solid ${
                            theme.colorScheme === "dark"
                              ? theme.colors.dark[4]
                              : theme.colors.gray[3]
                          }`,
                          padding: theme.spacing.sm,
                          borderRadius: theme.radius.md,
                          minHeight: 120,
                          fontSize: theme.fontSizes.sm,
                        })}
                      >
                        {form.values.groupDetail ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: form.values.groupDetail,
                            }}
                            className="rich-text-content"
                          />
                        ) : (
                          <Text color="dimmed" italic size="sm">
                            No description provided.
                          </Text>
                        )}
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </ScrollArea>
          )}
        </Box>
      </Flex>
      <Box
        p={10}
        style={{ borderTop: "1px solid #e9ecef", backgroundColor: "white" }}
      >
        <Group justify="flex-end">
          <Button
            variant="subtle"
            color="gray"
            onClick={prevStep}
            disabled={active === 0}
          >
            Back
          </Button>
          {active === 1 ? (
            <Button
              color="green"
              onClick={() => handleSubmit(form.values)}
              loading={loading}
              leftSection={<IconCheck size={18} />}
            >
              Submit Registration
            </Button>
          ) : (
            <Button onClick={nextStep}>Next Step</Button>
          )}
        </Group>
      </Box>
      {/* Controller */}
    </Flex>
  );
}
