import { ActionIcon, Button, Menu, Table } from '@mantine/core'
import { useEffect, useState } from 'react'
import { deleteprovinces, getprovinces } from '../../../API/Utils/HealthInstiUtils';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import HealthInsUtilsModal from '../../UI/Modals/HealthInsUtilsModal';
import { notifications } from '@mantine/notifications';

export default function ProvinceTable() {

    const [province, setprovince] = useState([]);

    const [opened, { open, close }] = useDisclosure(false);
    const [selecteddata, setSelecteddata] = useState(null);

    const fetchprovince = async () => {
        try {
            const data = await getprovinces();
            setprovince(data)
        } catch (error) {
            cconsole.error("Error fetching Data:", err);
        }
    }

    const deleleProvinces = async (id) => {
        try {
            await deleteprovinces(id);
            notifications.show({
                color: "red",
                title: 'Deletion Successful',
                message: `Province Code ${id} was deleted.`,
            });
            await fetchprovince();
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

    const updateProvinces = async (prov) => {
        setSelecteddata(prov);
        open();
    }

    const handleModalClose = () => {
        setSelecteddata(null);
        close();
    }

    useEffect(() => {
        fetchprovince()
    }, [])


    return (
        <>
            <Button onClick={() => open()}>
                Add new Province
            </Button>
            <HealthInsUtilsModal data={selecteddata} onClose={handleModalClose} onSuccess={fetchprovince} opened={opened} />
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Code</Table.Th>
                        <Table.Th>Province name</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {province.map((prov) => {
                        return (
                            <Table.Tr key={prov.province_code}>
                                <Table.Td>{prov.province_code}</Table.Td>
                                <Table.Td>{prov.province_name}</Table.Td>
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
                                                onClick={() => updateProvinces(prov)}
                                            >
                                                Edit Entry
                                            </Menu.Item>

                                            <Menu.Item
                                                leftSection={<IconTrash size={14} />}
                                                color="red"
                                                onClick={() => deleleProvinces(prov.province_code)}
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