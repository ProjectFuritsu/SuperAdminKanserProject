import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { deleteGroupType, getGroupType } from "../../../API/Utils/SupportGroupsUtils";
import { ActionIcon, Button, Menu, Table } from "@mantine/core";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import SupportGroupsModal from "../../UI/Modals/SupportGroupsModal";
import { notifications } from "@mantine/notifications";


export default function SupportGroupTypeTable() {
    const [grouptype, setgrouptype] = useState([]);

    const [opened, { open, close }] = useDisclosure(false);
    const [selecteddata, setSelecteddata] = useState(null);


    const fetchgrouptype = async () => {
        try {
            const data = await getGroupType();
            setgrouptype(data)
        } catch (error) {
            cconsole.error("Error fetching Data:", err);
        }
    }

    const delelegrouptype = async (typeid) => {
        try {
            await deleteGroupType(typeid);
            notifications.show({
                color: "red",
                title: 'Deletion Successful',
                message: `Province Code ${typeid} was deleted.`,
            });
            await fetchgrouptype();
        } catch (error) {
            console.error("Error during deletion:", error);
            // Show error notification
            notifications.show({
                color: "red",
                title: 'Deletion Failed',
                message: 'Could not delete this province.',
            });
        }
    }


    const updategrouptype = async (typedata) => {
        setSelecteddata(typedata);
        open();
    }

    const handleModalClose = () => {
        setSelecteddata(null);
        close();
    }

    useEffect(() => {
        fetchgrouptype()
    }, [])

    return (
        <>
            <Button onClick={() => open()}>
                Add new Province
            </Button>
            <SupportGroupsModal data={selecteddata} onClose={handleModalClose} onSuccess={fetchgrouptype} opened={opened}/>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Code</Table.Th>
                        <Table.Th>Province name</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {grouptype.map((typedata) => {
                        return (
                            <Table.Tr key={typedata.group_type_code}>
                                <Table.Td>{typedata.group_type_code}</Table.Td>
                                <Table.Td>{typedata.group_type_name}</Table.Td>
                                <Table.Td>
                                    <Menu withinPortal position="bottom-end" shadow="sm">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDots size={16} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconEdit size={14} />}
                                                onClick={() => updategrouptype(typedata)}
                                            >
                                                Edit Entry
                                            </Menu.Item>

                                            <Menu.Item
                                                leftSection={<IconTrash size={14} />}
                                                color="red"
                                                onClick={() => delelegrouptype(typedata.group_type_code)}
                                            >
                                                Delete Entry
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Table.Td>
                            </Table.Tr>
                        )
                    })}
                </Table.Tbody>
            </Table >
        </>
    )
}
