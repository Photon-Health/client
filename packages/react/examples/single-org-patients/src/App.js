import {
  Container,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  HStack,
  Text,
  Center,
  Box,
  Stack,
  Heading,
  Button,
  Input,
} from "@chakra-ui/react";
import { usePhoton } from "@photonhealth/react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import InfiniteScroll from "react-infinite-scroll-component";
import { ThreeDots } from "react-loader-spinner";

const Login = () => {
  const { login } = usePhoton();

  return (
    <Stack spacing="8">
      <Stack
        spacing="4"
        direction="column"
        justify="space-between"
        align="start"
      >
        <Stack spacing="1"></Stack>
        <Heading fontWeight="medium">Welcome</Heading>
      </Stack>
      <Button
        colorScheme="blue"
        onClick={() => login({})}
      >
        Login
      </Button>
    </Stack>
  );
};

const PatientTable = () => {
  const { getPatients, logout } = usePhoton();
  const [filterText, setFilterText] = useState("");
  const [rows, setRows] = useState([]);
  const [finished, setFinished] = useState(false);
  const [filterTextDebounce] = useDebounce(filterText, 250);

  const { patients, loading, refetch } = getPatients({
    name: filterTextDebounce.length > 0 ? filterTextDebounce : null,
  });

  useEffect(() => {
    if (!loading) {
      setRows(patients);
      setFinished(patients.length === 0);
    }
  }, [patients, loading]);

  return (
    <Stack spacing="8">
      <Stack
        spacing="4"
        pt="8"
        direction="column"
        justify="space-between"
        align="start"
      >
        <Stack direction="row" w="full">
          <Heading flex="1" flexGrow fontWeight="medium">
            Patients
          </Heading>
          <Button colorScheme="blue" onClick={() => logout({})}>
            Logout
          </Button>
        </Stack>
      </Stack>
      <Stack spacing="5">
        <Box>
          <Input
            type="text"
            placeholder={"Patient name"}
            onChange={(evt) => setFilterText(evt.target.value)}
            value={filterText}
          />
        </Box>
        <Box overflowX="auto">
          <InfiniteScroll
            dataLength={rows.length}
            scrollableTarget={
              document
                .getElementById("root")
                ?.getElementsByTagName("section")[0]
            }
            next={async () => {
              const { data } = await refetch({
                name:
                  filterTextDebounce.length > 0
                    ? filterTextDebounce
                    : undefined,
                after: rows?.at(-1)?.id,
              });
              if (data?.patients.length === 0) {
                setFinished(true);
              }
              setRows(rows.concat(data?.patients));
            }}
            hasMore={(rows.length % 25 === 0 && !finished) || false}
            loader={
              rows.length > 0 ? (
                <Table>
                  <Thead>
                    <Tr>
                      <Td>
                        <Center>
                          <ThreeDots
                            height="50"
                            width="50"
                            color="gray"
                            ariaLabel="loading"
                          />
                        </Center>
                      </Td>
                    </Tr>
                  </Thead>
                </Table>
              ) : null
            }
          >
            <Table>
              <Tbody>
                {rows.map((x) => {
                  return (
                    <Tr key={x.id}>
                      <Td>{x.name.full}</Td>
                      <Td>{x.gender}</Td>
                      <Td>{x.email}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </InfiniteScroll>
          {loading && (
            <Center padding="100px">
              <ThreeDots
                height="50"
                width="50"
                color="gray"
                ariaLabel="loading"
              />
            </Center>
          )}
          <Box px={{ base: "4", md: "6" }} pb="5">
            <HStack spacing="3" justify="space-between">
              {loading ? (
                <Text />
              ) : (
                <Text color="muted" fontSize="sm">
                  Showing {rows.length} results
                </Text>
              )}
            </HStack>
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
};

function App() {
  const { isAuthenticated, isLoading } = usePhoton();
  return (
    <Flex direction={"column"} justify={"center"}>
      <Container>
        {isLoading ? (
          <Center padding="100px">
            <ThreeDots
              height="50"
              width="50"
              color="gray"
              ariaLabel="loading"
            />
          </Center>
        ) : isAuthenticated ? (
          <PatientTable />
        ) : (
          <Login />
        )}
      </Container>
    </Flex>
  );
}

export default App;
