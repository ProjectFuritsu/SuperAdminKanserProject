import { useDisclosure } from '@mantine/hooks';
import React, { useEffect, useState } from 'react'
import { deletebarangay, getbarangay } from '../../../API/Utils/HealthInstiUtils';
import { notifications } from '@mantine/notifications';
import { ActionIcon, Button, Center, Loader, Menu, Pagination, Table } from '@mantine/core';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import BrgyModal from '../../UI/Modals/BrgyModal';


const PAGE_SIZE = 8;

export default function BrgyTable() {

    const [brgy, setbrgy] = useState([]);
    const [activePage, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [opened, { open, close }] = useDisclosure(false);
    const [selecteddata, setSelecteddata] = useState(null);


    const fetchbrgy = async () => {
        setLoading(true);
        try {
            const from = (activePage - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            // Ensure your utility returns { data, count }
            const result = await getbarangay(from, to);

            setbrgy(result.data || []);
            setTotalCount(result.count || 0);
        } catch (error) {
            console.error("Error fetching Data:", error);
        } finally {
            setLoading(false);
        }
    }



    const deletebrgy = async (id) => {
        try {
            await deletebarangay(id);
            notifications.show({
                color: "red",
                title: 'Deletion Successful',
                message: `brgy Code ${id} was deleted.`,
            });
            await fetchbrgy();
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

    const handleModalClose = () => {
        setSelecteddata(null);
        close()
    }
    const updatebrgy = async (brgy) => {
        setSelecteddata(brgy);
        open();
    }


    // Trigger fetch every time activePage changes
    useEffect(() => {
        fetchbrgy();
    }, [activePage]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <>
            <BrgyModal data={selecteddata} onClose={handleModalClose} onSuccess={fetchbrgy} opened={opened} />

            <Button onClick={() => open()} mb="md">
                Add new Barangay
            </Button>

            <Table verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Code</Table.Th>
                        <Table.Th>Barangay name</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {loading ? (
                        <Table.Tr><Table.Td colSpan={3}><Center><Loader size="sm" /></Center></Table.Td></Table.Tr>
                    ) : (
                        brgy.map((item) => (
                            <Table.Tr key={item.brgy_code}>
                                <Table.Td>{item.brgy_code}</Table.Td>
                                <Table.Td>{item.brgy_name}</Table.Td>
                                <Table.Td>
                                    <Menu withinPortal position="bottom-end" shadow="sm">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDots size={16} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => updatebrgy(item)}>
                                                Edit Entry
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => deletebrgy(item.brgy_code)}>
                                                Delete Entry
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Table.Td>
                            </Table.Tr>

                        ))
                    )}
                </Table.Tbody>
            </Table>

            {/* THE PAGINATION CONTROL */}
            <Center mt="xl">
                <Pagination
                    total={totalPages > 0 ? totalPages : 1}
                    value={activePage}
                    onChange={setPage}
                    withEdges // Adds "First" and "Last" buttons for better UX
                />  
            </Center>
        </>
    )
}
