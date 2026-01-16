import { useEffect, useState } from "react";
import {
  Container,
  SimpleGrid,
  Card,
  Text,
  Badge,
  Group,
  Skeleton,
  Title,
  Alert,
  Stack,
  Button,
  Divider,
  Modal,
  ActionIcon,
  TextInput,
  Textarea,
  Select,
} from "@mantine/core";
import { IconAlertCircle, IconEdit, IconTrash } from "@tabler/icons-react";
import FeedsCardButton from "../UI/Cards/feedsCardButton";
import {
  deletefeed,
  getFeeds,
  updateContentDetails,
  updatefeed,
  updateReference,
} from "../../API/feedAPI";
import { useDisclosure } from "@mantine/hooks";
import {
  getpublicationauthor,
  publicationTypes,
} from "../../API/Utils/PublicationUtils";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import FeedEditModal from "../UI/Modals/feedEditModal";
import { notifications } from "@mantine/notifications";

export default function Feed() {
  const [pubData, setPubData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [pubType, setPublicationTypes] = useState([]);
  const [authordata, setAuthordata] = useState([]);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFeeds();
      setPubData(res);
    } catch (err) {
      setError("We couldn't load your feed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getpubType = async () => {
    try {
      const response = await publicationTypes();
      const formatted = response.map((item) => ({
        value: item.publication_type_code.toString(),
        label: item.type_description,
      }));

      setPublicationTypes(formatted);
    } catch (error) {
      console.error("Failed to load publication types", error);
    }
  };

  const getAuthors = async () => {
    try {
      const response = await getpublicationauthor();
      const formatted = response.map((item) => ({
        value: item.author_id.toString(),
        label: item.author_name,
      }));

      setAuthordata(formatted);
    } catch (error) {
      console.error("Fetching author Error:", error);
      throw error;
    }
  };

  useEffect(() => {
    getpubType();
    getAuthors();
    fetchPublications();
  }, []);

  const handledeletePublication = async (pubid) => {
    try {
      await deletefeed(pubid);
      notifications.show({
        title: "Success",
        message: "Deletion of Publication was successfully",
        color: "green",
      });
      modals.closeAll();
      fetchPublications();
    } catch (error) {
      console.error(`Deletion:`, error);

      notifications.show({
        title: "Error",
        message: "Deletion of Publication was encountered an error",
        color: "Red",
      });
    }
  };

  const openModal = (post) => {
    // 1. Prepare the data
    const initialValues = {
      publication_title: post.publication_title || "",
      publication_date: post.publication_date
        ? new Date(post.publication_date)
        : new Date(),
      author_id:
        post.author_id?.toString() ||
        post.publication_author?.author_id?.toString() ||
        "",
      publication_type:
        post.publication_type.publication_type_code.toString() || "",
      detail: post.publication_content?.[0]?.content_detail || "",
      ref_detail: post.publication_reference?.[0]?.ref_detail || "",
    };

    // 2. Pass the component as a child
    modals.open({
      title: "Publicaition Details",
      centered: true,
      size: "lg",
      children: (
        <FeedEditModal
          initialValues={initialValues}
          pubType={pubType}
          authordata={authordata}
          onSave={(values) => handleSave(post.publication_id, values)}
          handleDelete={() => handledeletePublication(post.publication_id)}
        />
      ),
    });
  };

  const handleSave = async (id, values) => {
    try {
      setLoading(true);
      modals.closeAll();

      // 1. Prepare the payload to match your database structure
      const feedpayload = {
        publication_title: values.publication_title,
        publication_date: values.publication_date,
        author_id: parseInt(values.author_id),
        publication_type: parseInt(values.publication_type),
      };

      const feedcontentpayload = {
        content_detail: values.detail,
      };

      const feedrefpayload = {
        ref_detail: values.ref_detail,
      };

      await updatefeed(id, feedpayload);
      await updateContentDetails(id, feedcontentpayload);
      await updateReference(id, feedrefpayload);
      // 4. Success UI actions

      fetchPublications();
      notifications.show({
        title: "Success",
        message: "Publication Details updated successfully",
        color: "green",
      });
      // Optional: show a notification here using @mantine/notifications
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "An error was encountered during updating data.",
        color: "red",
      });
      setError("Failed to save changes. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <Stack mb="xl" gap="xs">
        <Title order={2} fw={800}>
          Community Feed
        </Title>
        <Text c="dimmed" size="sm">
          Latest text updates and publications from your network.
        </Text>
      </Stack>

      {/* Grid Layout */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {/* Always show the Create Button first */}
        <FeedsCardButton onSuccess={fetchPublications} />

        {/* Loading Skeletons */}
        {loading &&
          [...Array(5)].map((_, i) => (
            <Card key={i} p="lg" radius="md" withBorder>
              <Skeleton height={20} width="60%" mb="md" />
              <Skeleton height={12} mt={6} radius="xl" />
              <Skeleton height={12} mt={6} radius="xl" />
              <Skeleton height={12} mt={6} width="80%" radius="xl" />
              <Skeleton height={36} mt="xl" radius="md" />
            </Card>
          ))}

        {/* Actual Data */}
        {!loading &&
          pubData.map((item, index) => (
            <Card
              key={index}
              shadow="xs"
              padding="xl"
              radius="md"
              withBorder
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <Group justify="space-between" mb="sm">
                <Badge variant="light" color="blue" size="sm">
                  {item.publication_type.type_description}
                </Badge>
                <Text size="xs" c="dimmed">
                  {item.publication_date || "Just now"}
                </Text>
              </Group>

              <Title order={4} lineClamp={1} mb="xs">
                {item.publication_title}
              </Title>

              <Divider mb="sm" variant="dashed" />

              <Text size="sm" c="dimmed" lineClamp={4} style={{ flex: 1 }}>
                Author: {item.publication_author.author_name}
              </Text>

              {/* 2. Updated the bottom button to clearly state 'Edit' */}
              <Button
                leftSection={<IconEdit size={16} />}
                variant="light"
                color="blue"
                fullWidth
                mt="xl"
                radius="md"
                onClick={() => openModal(item)}
              >
                Edit Publication
              </Button>
            </Card>
          ))}
      </SimpleGrid>

      {/* Empty State */}
      {!loading && !error && pubData.length === 0 && (
        <Stack align="center" py={100} gap="sm">
          <Text fw={600} size="lg">
            The feed is quiet...
          </Text>
          <Text c="dimmed" size="sm">
            Post something above to get the conversation started.
          </Text>
        </Stack>
      )}
    </Container>
  );
}
